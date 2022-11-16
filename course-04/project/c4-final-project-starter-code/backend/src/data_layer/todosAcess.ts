import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess{
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly todoIndex = process.env.TODOS_CREATED_AT_INDEX
    ){
      logger.info("Created the TodosAccess object")
    }

    async getTodos(userId: string): Promise<TodoItem[]>{
      logger.info("About to query todos for user: ", userId)
      
      const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: this.todoIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            },
            ScanIndexForward: false
          }).promise()

      logger.info("Query returned with result: ", result.Items)
      return result.Items as TodoItem[]
    }

    async createTodo(todo: TodoItem){
      logger.info("About to put new todo item in ToDos Table: ", todo)
      await this.docClient.put({
        TableName: this.todoTable,
        Item: todo
      }).promise()
      logger.info("Successfully added item ", todo)
      return todo
    }

    async delTodo(userId:string, todoId: string) {
      const key = {
        userId,
        todoId
      }
      logger.info("Removing todo with id ", todoId, " from user ", userId)

      await this.docClient.delete({
        TableName: this.todoTable,
        Key: key
      }).promise()
      
      logger.info("Deletion successful")
    }

    async updateTodo(update: TodoUpdate, userId: string, todoId: string)
    {
        const key = {
          userId,
          todoId
        }
        logger.info("About to update item: ", key)
        await this.docClient.update({
          TableName: this.todoTable,
          Key: key,
          UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeValues: {
            ':name': update.name,
            ':dueDate': update.dueDate,
            ':done': update.done
          }, 
          ExpressionAttributeNames: {
            '#name': 'name'
          }
        }).promise()
        
        logger.info("Update of item was successful")
    }
}