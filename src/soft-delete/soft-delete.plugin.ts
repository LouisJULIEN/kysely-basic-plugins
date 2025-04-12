import {
  AliasNode,
  BinaryOperationNode,
  ColumnNode,
  IdentifierNode,
  JoinNode,
  KyselyPlugin,
  OperationNode,
  OperationNodeTransformer,
  OperatorNode,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  QueryResult,
  RawNode,
  ReferenceNode,
  RootOperationNode,
  SelectQueryNode,
  TableNode,
  UnknownRow,
  UpdateQueryNode,
  WhereNode,
} from "kysely";

// credits: https://github.com/kysely-org/kysely/issues/803
export class SoftDelete implements KyselyPlugin {
  private transformer: SoftDeleteQueryTransformer;

  constructor(...args: ConstructorParameters<typeof SoftDeleteQueryTransformer>) {
    this.transformer = new SoftDeleteQueryTransformer(...args);
  }

  transformQuery({ node }: PluginTransformQueryArgs): RootOperationNode {
    return this.transformer.transformNode(node);
  }

  transformResult({ result }: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>> {
    return Promise.resolve(result);
  }
}

class SoftDeleteQueryTransformer extends OperationNodeTransformer {
  private deletedAtColumnName: string;
  private ignoredTables: string[];

  constructor({
    deletedAtColumnName,
    ignoredTables,
  }: {
    deletedAtColumnName?: string;
    ignoredTables?: string[];
  }) {
    super();
    this.deletedAtColumnName = deletedAtColumnName || "deleted_at";
    this.ignoredTables = ignoredTables || [];
  }

  protected override transformSelectQuery(originalNode: SelectQueryNode): SelectQueryNode {
    const node = super.transformSelectQuery(originalNode);
    return this.addDeletedAtCondition(node);
  }

  protected override transformUpdateQuery(originalNode: UpdateQueryNode): UpdateQueryNode {
    const node = super.transformUpdateQuery(originalNode);
    return this.addDeletedAtCondition(node);
  }

  private addDeletedAtCondition<T extends SelectQueryNode | UpdateQueryNode>(node: T): T {
    let where: WhereNode | undefined = node.where;
    if (node.from) {
      for (const from of node.from.froms) {
        const deletedAtReference = this.getDeletedAtReference(from);
        if (deletedAtReference) {
          where = this.addIsNotDeletedFilter(where, deletedAtReference);
        }
      }
    }
    if (node.joins) {
      for (const join of node.joins) {
        const deletedAtReference = this.getDeletedAtReference(join);
        if (deletedAtReference) {
          where = this.addIsNotDeletedFilter(where, deletedAtReference);
        }
      }
    }
    return {
      ...node,
      where,
    };
  }

  private getDeletedAtReference(node: OperationNode): ReferenceNode | null {
    if (JoinNode.is(node)) {
      if (node.table == null) {
        throw new SoftDeleteError("Join without a table");
      }
      return this.getDeletedAtReference(node.table);
    }

    const deletedAtColumn = ColumnNode.create(this.deletedAtColumnName);
    if (TableNode.is(node)) {
      const tableName = node.table.identifier.name;
      if (!this.tableShouldHaveDeletedAt(tableName)) {
        return null;
      }

      return ReferenceNode.create(deletedAtColumn, node);
    }
    if (AliasNode.is(node)) {
      if (!IdentifierNode.is(node.alias)) {
        throw new SoftDeleteError("Alias without identifier", node.alias);
      }

      const tableAlias = node.alias.name;
      if (!this.tableShouldHaveDeletedAt(tableAlias)) {
        return null;
      }
      return ReferenceNode.create(deletedAtColumn, TableNode.create(tableAlias));
    }

    throw new SoftDeleteError(
      `Getting a reference to ${this.deletedAtColumnName} column for ${node.kind} is not supported yet.`,
      node,
    );
  }

  private addIsNotDeletedFilter(
    node: WhereNode | undefined,
    deletedAtReference: ReferenceNode,
  ): WhereNode {
    const filterOperation = BinaryOperationNode.create(
      deletedAtReference,
      OperatorNode.create("is"),
      RawNode.createWithSql("null"),
    );
    if (node == null) {
      return WhereNode.create(filterOperation);
    }

    return WhereNode.cloneWithOperation(node, "And", filterOperation);
  }

  private tableShouldHaveDeletedAt(tableName: string): boolean {
    return !tableName.startsWith("kysely_") && !this.ignoredTables.includes(tableName);
  }
}

export class SoftDeleteError extends Error {
  constructor(
    message: string,
    readonly node?: OperationNode,
  ) {
    super(message);
  }
}
