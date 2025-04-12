import {
  ColumnNode,
  ColumnUpdateNode,
  KyselyPlugin,
  OperationNode,
  OperationNodeTransformer,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  QueryResult,
  RawNode,
  RootOperationNode,
  TableNode,
  UnknownRow,
  UpdateQueryNode,
} from "kysely";

export class AutoUpdatedAtPlugin implements KyselyPlugin {
  private transformer: AutoUpdatedAtQueryTransformer;

  constructor(...args: ConstructorParameters<typeof AutoUpdatedAtQueryTransformer>) {
    this.transformer = new AutoUpdatedAtQueryTransformer(...args);
  }

  transformQuery({ node }: PluginTransformQueryArgs): RootOperationNode {
    return this.transformer.transformNode(node);
  }

  transformResult({ result }: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>> {
    return Promise.resolve(result);
  }
}

class AutoUpdatedAtQueryTransformer extends OperationNodeTransformer {
  private updatedAtColumnName: string;
  private ignoredTables: string[];

  constructor({
    deletedAtColumnName,
    ignoredTables,
  }: {
    deletedAtColumnName?: string;
    ignoredTables?: string[];
  }) {
    super();
    this.updatedAtColumnName = deletedAtColumnName || "updated_at";
    this.ignoredTables = ignoredTables || [];
  }

  protected override transformUpdateQuery(originalNode: UpdateQueryNode): UpdateQueryNode {
    const node = super.transformUpdateQuery(originalNode);
    return this.setUpdatedAt(node);
  }

  private setUpdatedAt<T extends UpdateQueryNode>(node: T): T {
    if (!node.table || !TableNode.is(node.table)) {
      throw new SoftDeleteError("no table to update", node);
    }

    const tableName = node.table.table.identifier.name;
    if (!this.tableShouldHaveUpdatedAt(tableName)) {
      return node;
    }

    const updates = node.updates || [];
    const updateUpdatedAtColumn = ColumnNode.create(this.updatedAtColumnName);
    const updatedAtUpdate = ColumnUpdateNode.create(
      updateUpdatedAtColumn,
      RawNode.createWithSql("NOW()"),
    );

    return {
      ...node,
      updates: [...updates, updatedAtUpdate],
    };
  }

  private tableShouldHaveUpdatedAt(tableName: string): boolean {
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
