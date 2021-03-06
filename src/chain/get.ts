import BaseChain from './base'
import { decode } from '../utils/convert'
import * as expr from '../expression'
import type { Fields, DBItem } from '../types'

export class GetChain<T extends Fields> extends BaseChain<DBItem<T>, T> {
  constructor(
    fields: T,
    client: AWS.DynamoDB.DocumentClient,
    private readonly table: string,
    private readonly key: any,
    private readonly selected?: string[]
  ) {
    super(fields, client)
  }

  async execute() {
    const params: Partial<AWS.DynamoDB.GetItemInput> = {
      TableName: this.table,
      Key: this.key,
    }

    Object.assign(params, expr.project(...(this.selected ?? [])))

    const { Item } = await this.client.get(params as any).promise()

    this.resolve(decode(Item) as any)
  }

  public select(...fields: string[]): this {
    return this.clone(this.fields, fields)
  }

  protected clone(fields = this.fields, selected?: string[]): this {
    return new GetChain(
      fields,
      this.client,
      this.table,
      this.key,
      selected
    ) as any
  }
}
