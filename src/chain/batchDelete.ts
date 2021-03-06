import BaseChain from './base'
import { batch } from '../utils/array'
import type { Fields, DBItem } from '../types'

export class BatchDeleteChain<T extends Fields> extends BaseChain<
  undefined,
  T
> {
  constructor(
    schema: T,
    client: AWS.DynamoDB.DocumentClient,
    private readonly table: string,
    private readonly keys: any[]
  ) {
    super(schema, client)
  }

  async execute() {
    await Promise.all(batch(this.keys, 25).map(batch => this.delete(batch)))
    this.resolve(undefined as any)
  }

  private async delete(keys: any[]) {
    await this.client
      .batchWrite({
        RequestItems: {
          [this.table]: keys.map(Key => ({
            DeleteRequest: { Key },
          })),
        },
      })
      .promise()
  }

  protected clone(fields = this.fields) {
    return new BatchDeleteChain(
      fields,
      this.client,
      this.table,
      this.keys
    ) as any
  }
}
