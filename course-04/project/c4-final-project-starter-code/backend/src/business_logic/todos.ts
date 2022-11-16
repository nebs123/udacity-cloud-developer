import { TodosAccess } from '../data_layer/todosAcess'
import { AttachmentUtils } from '../s3/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('todos')
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info("About to get todo for user: ", userId)
    return todoAccess.getTodos(userId)
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string){
    logger.info("About to call pre signed url function in attachmentUtils")
    
    const preloadUrl = attachmentUtils.createPresignedUrl(userId, todoId)

    logger.info("About to call attachUrl")
    await todoAccess.attachUrl(userId, todoId, attachmentUtils.getAttachmentUrl(userId, todoId))
    logger.info("Successfully called attachUrl")

    return preloadUrl

}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string)
{
    const todoId = uuid.v4()
    logger.info("About to call data layer create function")
    return await todoAccess.createTodo({
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function deleteTodo(userId: string, todoId: string)
{
    logger.info("About to call data layer delete function")
    await todoAccess.delTodo(userId, todoId)
}

export async function updateTodo(updates: UpdateTodoRequest, userId: string, todoId: string)
{
    logger.info("About to update todo with id ", todoId, " for user ", userId)
    logger.info("Data to update ", updates)

    await todoAccess.updateTodo(
        {
            name: updates.name,
            dueDate: updates.dueDate,
            done: updates.done
        }, 
        userId, 
        todoId
    )
    logger.info("Successfully updated todo item")
}