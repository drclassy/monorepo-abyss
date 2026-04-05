/**
 * PORTAL Sentra — Service Manager Types
 * Docker-based service orchestration for solo developers
 */

// ============================================================================
// Service Definitions
// ============================================================================

export type ServiceType = 'database' | 'cache' | 'queue' | 'mail' | 'search'

export interface ServiceDefinition {
  id: string
  type: ServiceType
  name: string
  description: string
  icon: string
  defaultPort: number
  docker: {
    image: string
    tag: string
    env: Record<string, string>
    ports: Record<string, number> // containerPort -> hostPort
    volumes: string[]
    healthCheck?: {
      test: string[]
      interval: string
      timeout: string
      retries: number
    }
  }
  credentials: {
    username?: string
    password?: string
    database?: string
  }
  ui?: {
    adminPort?: number // For web UIs like Mailpit (8025), RabbitMQ (15672)
    adminPath?: string
  }
}

// ============================================================================
// Running Service Instance
// ============================================================================

export type ServiceStatus = 'creating' | 'running' | 'stopping' | 'stopped' | 'error'

export interface ServiceInstance {
  id: string
  definitionId: string
  projectId?: string // Optional: linked to project
  name: string
  status: ServiceStatus
  containerId?: string
  ports: Record<string, number> // actual mapped ports
  env: Record<string, string>
  volumes: string[]
  createdAt: Date
  startedAt?: Date
  stoppedAt?: Date
  healthStatus?: 'healthy' | 'unhealthy' | 'starting'
  logs?: ServiceLogEntry[]
}

// ============================================================================
// Service Operations
// ============================================================================

export interface CreateServiceInput {
  definitionId: string
  name: string
  projectId?: string
  customPort?: number // Override default port
  customEnv?: Record<string, string>
}

export interface ServiceLogEntry {
  timestamp: Date
  source: 'stdout' | 'stderr'
  message: string
}

// ============================================================================
// Predefined Services Catalog
// ============================================================================

export const SERVICE_CATALOG: ServiceDefinition[] = [
  {
    id: 'postgres',
    type: 'database',
    name: 'PostgreSQL',
    description: 'Advanced open-source relational database',
    icon: 'Database',
    defaultPort: 5432,
    docker: {
      image: 'postgres',
      tag: '16-alpine',
      env: {
        POSTGRES_USER: 'sentra',
        POSTGRES_PASSWORD: '${generated}',
        POSTGRES_DB: 'app',
      },
      ports: { '5432': 5432 },
      volumes: ['postgres-data:/var/lib/postgresql/data'],
      healthCheck: {
        test: ['CMD-SHELL', 'pg_isready -U sentra'],
        interval: '5s',
        timeout: '5s',
        retries: 5,
      },
    },
    credentials: {
      username: 'sentra',
      password: '${generated}',
      database: 'app',
    },
  },
  {
    id: 'mysql',
    type: 'database',
    name: 'MySQL',
    description: 'Popular open-source relational database',
    icon: 'Database',
    defaultPort: 3306,
    docker: {
      image: 'mysql',
      tag: '8',
      env: {
        MYSQL_ROOT_PASSWORD: '${generated}',
        MYSQL_DATABASE: 'app',
        MYSQL_USER: 'sentra',
        MYSQL_PASSWORD: '${generated}',
      },
      ports: { '3306': 3306 },
      volumes: ['mysql-data:/var/lib/mysql'],
      healthCheck: {
        test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost'],
        interval: '5s',
        timeout: '5s',
        retries: 5,
      },
    },
    credentials: {
      username: 'sentra',
      password: '${generated}',
      database: 'app',
    },
  },
  {
    id: 'redis',
    type: 'cache',
    name: 'Redis',
    description: 'In-memory data structure store',
    icon: 'Zap',
    defaultPort: 6379,
    docker: {
      image: 'redis',
      tag: '7-alpine',
      env: {},
      ports: { '6379': 6379 },
      volumes: ['redis-data:/data'],
      healthCheck: {
        test: ['CMD', 'redis-cli', 'ping'],
        interval: '5s',
        timeout: '3s',
        retries: 5,
      },
    },
    credentials: {},
  },
  {
    id: 'mongodb',
    type: 'database',
    name: 'MongoDB',
    description: 'Document-oriented NoSQL database',
    icon: 'Leaf',
    defaultPort: 27017,
    docker: {
      image: 'mongo',
      tag: '7',
      env: {
        MONGO_INITDB_ROOT_USERNAME: 'sentra',
        MONGO_INITDB_ROOT_PASSWORD: '${generated}',
      },
      ports: { '27017': 27017 },
      volumes: ['mongodb-data:/data/db'],
      healthCheck: {
        test: ['CMD', 'mongosh', '--eval', 'db.adminCommand("ping")'],
        interval: '5s',
        timeout: '5s',
        retries: 5,
      },
    },
    credentials: {
      username: 'sentra',
      password: '${generated}',
    },
  },
  {
    id: 'mailpit',
    type: 'mail',
    name: 'Mailpit',
    description: 'Email testing tool with web UI',
    icon: 'Mail',
    defaultPort: 1025,
    docker: {
      image: 'axllent/mailpit',
      tag: 'latest',
      env: {
        MP_SMTP_AUTH_ACCEPT_ANY: '1',
        MP_SMTP_AUTH_ALLOW_INSECURE: '1',
      },
      ports: { '1025': 1025, '8025': 8025 },
      volumes: ['mailpit-data:/data'],
    },
    credentials: {},
    ui: {
      adminPort: 8025,
      adminPath: '/',
    },
  },
  {
    id: 'rabbitmq',
    type: 'queue',
    name: 'RabbitMQ',
    description: 'Message broker for distributed systems',
    icon: 'MessageSquare',
    defaultPort: 5672,
    docker: {
      image: 'rabbitmq',
      tag: '3-management',
      env: {
        RABBITMQ_DEFAULT_USER: 'sentra',
        RABBITMQ_DEFAULT_PASS: '${generated}',
      },
      ports: { '5672': 5672, '15672': 15672 },
      volumes: ['rabbitmq-data:/var/lib/rabbitmq'],
    },
    credentials: {
      username: 'sentra',
      password: '${generated}',
    },
    ui: {
      adminPort: 15672,
      adminPath: '/',
    },
  },
]
