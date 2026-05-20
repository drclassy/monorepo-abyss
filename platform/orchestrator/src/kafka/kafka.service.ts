import { Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common'
import { Kafka, type Producer } from 'kafkajs'

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: 'abyss-orchestrator',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  })

  private producer: Producer = this.kafka.producer()

  async onModuleInit() {
    await this.producer.connect()
    console.log('[Kafka] Producer connected')
  }

  async onModuleDestroy() {
    await this.producer.disconnect()
  }

  async emit(topic: string, payload: unknown) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(payload) }],
    })
    console.log(`[Kafka] Event emitted to ${topic}`)
  }
}
