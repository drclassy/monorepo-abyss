import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common'
import { type Observable, tap } from 'rxjs'

@Injectable()
export class ShadowModeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    const isShadowMode = request.body?.shadowMode || false

    return next.handle().pipe(
      tap(() => {
        if (isShadowMode) {
          // Logic: Dispatch shadow execution to Kafka topic without awaiting
          console.log(`[ShadowMode] Duplicating execution for shadow analysis...`)
          // this.kafkaClient.emit('shadow-exec', { payload: request.body });
        }
      })
    )
  }
}
