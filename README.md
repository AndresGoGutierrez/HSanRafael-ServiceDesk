# Hospital Desk Help

## Comandos de arranque

1. Inicializar proyecto de node:

   ```bash
   npm init -y
   ```

2. Instalar TypeScript e iniciar configuración:

   ```bash
   npm i -d typescript

   npx tsc --init
   ```

3. Instalar dependencias runtime

   ```bash
   npm i express zod pino pino-pretty jsonwebtoken bcryptjs cors dotenv morgan @prisma/client
   ```

4. Instalar dependencias de desarrollo

   ```bash
   npm i -D tsx ts-node nodemon

   npm i -D @types/node @types/express @types/jsonwebtoken @types/cors @types/morgan

   npm i -D prisma vitest @vitest/coverage-v8 supertest @types/supertest 

   npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier

   npm i -D prettier husky lint-staged

   npm i -D javascript-obfuscator
   ```

5. Inicializar prisma

   ```bash
   npx prisma init
   ```

6. Preparación de Husky

   ```bash
   npm run prepare
   ```

7. En el hook pre-commit, se debe añadir el comando `npx lint-staged`

## Configuración de tsconfig.json

```json showLineNumbers title="tsconfig.json"
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "target": "es2024",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": false,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": false,
    "strictPropertyInitialization": true
  },
  "include": [
    "src",
    "tests"
  ]
}
```

## Configuración de package.json

Este fragmento del package.json define los metadatos y automatizaciones clave de un proyecto backend en TypeScript, integrando herramientas como Prisma, Vitest, ESLint, Prettier y Husky para garantizar calidad, mantenibilidad y buenas prácticas. Los scripts permiten compilar (`build`), ejecutar en desarrollo o producción (`start:dev`, `start:prod`), testear (`test`, `test:e2e`), aplicar formato (`format:write`), validar estilo (`lint`), gestionar la base de datos (`prisma:migrate`, `prisma:studio`) y preparar hooks de Git (`prepare`). Además, la sección `lint-staged` asegura que solo los archivos modificados se formateen y corrijan antes de cada commit, promoviendo consistencia y eficiencia en el flujo de trabajo. Este tipo de configuración es ideal para documentar en guías institucionales sobre scaffolding backend y arquitectura limpia.

```json
{
  "name": "hospital-desk",
  "version": "0.1.0",
  "main": "index.js",
  "scripts": {
    "start:dev": "nodemon --watch src --ext ts --exec tsx src/main.ts",
    "start:prod": "node dist/main.js",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "vitest run tests/e2e",
    "lint": "eslint . --ext .ts",
    "format": "prettier --check .",
    "format:write": "prettier --write .",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prepare": "husky init"
  },
  "lint-staged": {
    "*.{ts,js,json,md}": [
      "prettier --write"
    ],
    "src/**/*.ts": [
      "eslint --fix"
    ]
  },
  ...
}
```

## Ajuste de prettier

Este archivo configura ESLint para un proyecto en TypeScript, estableciendo reglas que promueven buenas prácticas, legibilidad y seguridad en el código backend. Define el parser especializado `@typescript-eslint/parser`, habilita el entorno Node.js con soporte para ECMAScript 2024, y extiende recomendaciones de ESLint, TypeScript y Prettier para asegurar consistencia en estilo y estructura. Las reglas personalizadas refuerzan el uso de `const`, obligan a declarar tipos de retorno, evitan el uso incorrecto de promesas, restringen el uso de `any`, y permiten `console.warn` y `console.error` pero advierten sobre otros usos de `console`. Además, ignora carpetas como `dist` y `node_modules` para evitar análisis innecesario, y aplica advertencias más flexibles para variables o argumentos que comienzan con guion bajo, facilitando convenciones internas. Esta configuración es ideal para documentar en guías institucionales sobre calidad de código y scaffolding sostenible.

```cjs title="eslint.config.cjs"
const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const globals = require("globals");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([ {
    languageOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
        parserOptions: {
            project: './tsconfig.json',
            tsconfigRootDir: __dirname,
        },

        globals: {
            ...globals.node,
        },
    },

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),

    rules: {
        "@typescript-eslint/explicit-function-return-type": "error",

        "@typescript-eslint/no-misused-promises": [ "error", {
            checksVoidReturn: false,
        } ],

        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-explicit-any": "warn",

        "@typescript-eslint/no-unused-vars": [ "warn", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
        } ],

        "no-console": [ "warn", {
            allow: [ "warn", "error" ],
        } ],

        "prefer-const": "error",
    },
},
globalIgnores([
    "**/dist",
    "**/node_modules",
    "**/prisma",
    "./eslint.config.cjs",
]) ]);
```

Este fragmento corresponde a la configuración de Prettier, una herramienta de formateo automático de código, y define el estilo que se aplicará en todo el proyecto para mantener consistencia y legibilidad. Especifica el uso obligatorio de punto y coma (`semi: true`), comillas simples (`singleQuote: true`), comas finales en estructuras multilínea (`trailingComma: all`), un ancho máximo de línea de 100 caracteres (`printWidth`), indentación de 4 espacios (`tabWidth`), paréntesis obligatorios en funciones flecha (`arrowParens: always`), espacios dentro de llaves (`bracketSpacing: true`) y el uso de salto de línea tipo Unix (`endOfLine: lf`). Esta configuración es ideal para proyectos colaborativos, ya que facilita la revisión de código y evita conflictos de estilo entre desarrolladores.

```json title=".prettierrc"
{
    "semi": true,
    "singleQuote": false,
    "trailingComma": "all",
    "printWidth": 100,
    "tabWidth": 4,
    "arrowParens": "always",
    "bracketSpacing": true,
    "endOfLine": "lf"
}
```

## Configuración variables de entorno

```txt showLineNumbers
PORT=8000
NODE_ENV=development
JWT_SECRET=super_secret_dev_key

DB_DATABASE=hospital_desk
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

## Configuración de Docker-compose

Este fragmento define un entorno de base de datos en Docker Compose para el proyecto `hospital-desk`, configurando dos servicios: `db` y `pgadmin`. El servicio `db` utiliza la imagen ligera `postgres:16-alpine`, establece variables de entorno para inicializar la base de datos con credenciales dinámicas, expone el puerto definido por `${DB_PORT}`, y ejecuta un `healthcheck` para verificar la disponibilidad mediante `pg_isready`. Además, monta un archivo SQL de inicialización (`init.sql`) al directorio de entrada de PostgreSQL. El servicio `pgadmin` proporciona una interfaz web para administrar la base de datos, usando la imagen oficial `pgadmin4`, configurando credenciales por variables de entorno, y exponiendo el puerto 5050. Este servicio depende de que `db` esté activo y persiste sus datos en el volumen `pgadmin_data`, definido al final del archivo. Esta configuración es ideal para documentar entornos reproducibles en semilleros y guías institucionales sobre scaffolding backend.

```yml showLineNumbers
services:
  db:
    container_name: hospital-desk-db
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - ${DB_PORT}:5432
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_DATABASE}"]
      interval: 5s
      timeout: 3s
      retries: 10
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
  
  pgadmin:
    container_name: hospital-desk-pgadmin
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_DEFAULT_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD}
    ports:
      - "5050:80"
    depends_on:
      - db
    volumes:
      - pgadmin_data:/var/lib/pgadmin

volumes:
  db_data:
  pgadmin_data:
```

Ya que estaremos trabajando con bind-volumes, debemos establecer un comando de inicialización de base de datos en el archivo `db/init.sql`:

```sql
SELECT 'CREATE DATABASE hospital_desk'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'hospital_desk'
)\gexec
```

Para levantar el servicio en modo detached:

```bash
docker-compose up -d
```

Para bajar y eliminar los contenedores:

```bash
docker-compose down -v
```

En las variables de entorno, añadir:

```txt showLineNumbers
PGADMIN_DEFAULT_EMAIL=admin@hospital.edu
PGADMIN_DEFAULT_PASSWORD=admin123

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?schema=public"
```

## Establecer servidor en pgAdmin 4

Al momento de levantar la página web del contenedor pgAdmin en `http://localhost:5050/browser/`, registramos un nuevo servidor con las siguientes variables:

- Name: hospital-desk (nombre de referencia)
- Hostname: db (nombre del servicio de la base de datos)
- Port: 5432
- Username: postgres
- Password: postgres

## Configuración de schema.prisma

Antes de proseguir con el esquema, vamos a instalar la extensión de pgcrypto para generar los uuid de en la base de datos:

```sql showLineNumbers
...

\connect hospital_desk
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Este archivo define el esquema de Prisma para un proyecto con base de datos PostgreSQL, especificando cómo se generan los clientes (`generator client`) y cómo se conecta al origen de datos (`datasource db`) mediante una variable de entorno. Modela tres entidades: `User`, `Area` y `Ticket`, cada una con identificadores únicos (`uuid()`), atributos relevantes y relaciones explícitas. Los usuarios y áreas pueden tener múltiples tickets asociados, mientras que cada ticket pertenece a un usuario y a un área, lo que se gestiona mediante relaciones nombradas (`@relation`). Además, se definen índices en campos clave como `status`, `priority`, `userId` y `areaId` para optimizar las consultas. Esta estructura es ideal para documentar en guías institucionales sobre modelado de datos, ya que refleja buenas prácticas en diseño relacional, escalabilidad y claridad semántica.

```prisma title="prisma/schema.prisma"
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
  output   = "./generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name    String
  email   String   @unique
  tickets Ticket[] @relation("UserTickets")
}

model Area {
  id      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name    String
  tickets Ticket[] @relation("AreaTickets")
}

model Ticket {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title     String
  status    String
  priority  String
  createdAt DateTime @default(now())
  userId    String   @db.Uuid
  areaId    String   @db.Uuid

  user User @relation("UserTickets", fields: [userId], references: [id])
  area Area @relation("AreaTickets", fields: [areaId], references: [id])

  @@index([status])
  @@index([priority])
  @@index([userId])
  @@index([areaId])
}
```

Posterior a la configuración se deben ejecutar los siguientes comandos:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Extender el archivo tsconfig para producción

Este archivo tsconfig.build.json extiende la configuración principal de TypeScript (tsconfig.json) y está diseñado específicamente para el proceso de compilación. Su propósito es excluir las carpetas node_modules y dist del análisis y la salida del compilador, evitando así incluir dependencias externas y archivos ya compilados. Esta separación permite mantener una configuración limpia y enfocada en los archivos fuente del proyecto, lo cual es útil para entornos institucionales que requieren flujos de compilación reproducibles y eficientes dentro de un scaffolding backend bien estructurado.

```json showLineNumbers title="tsconfig.build.json"
{
    "extends": "./tsconfig.json",
    "exclude": [
        "node_modules",
        "dist"
    ]
}
```

## Mapear las variables de entorno

Este fragmento define y valida las variables de entorno de un proyecto backend usando la librería `zod`, asegurando que cada parámetro requerido esté presente y cumpla con reglas específicas antes de que la aplicación se inicie. Se construye un esquema (`envSchema`) que transforma y valida tipos como números (`PORT`, `DB_PORT`), cadenas con longitud mínima (`JWT_SECRET`, `DB_PASSWORD`, `PGADMIN_DEFAULT_PASSWORD`), correos electrónicos (`PGADMIN_DEFAULT_EMAIL`) y enums (`NODE_ENV`), asignando valores por defecto cuando es pertinente. Luego, se infiere el tipo `EnvVariables` para tipar el entorno de forma segura, y la función `loadEnv` aplica el esquema sobre `process.env`, garantizando que la configuración esté completa y libre de errores. Esta práctica es esencial para documentar entornos robustos en guías institucionales, ya que refuerza la seguridad, la claridad y la trazabilidad en proyectos con scaffolding backend.

```ts showLineNumbers title="src/config/env.config.ts"
import { z } from "zod";

const envSchema = z.object( {
    PORT: z.coerce.number().default( 3333 ),
    NODE_ENV: z.enum( [ "development", "test", "production" ] ).default( "development" ),
    JWT_SECRET: z.string().min( 8 ),

    DB_DATABASE: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string().min( 8 ),
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number().default( 5432 ),

    PGADMIN_DEFAULT_EMAIL: z.email(),
    PGADMIN_DEFAULT_PASSWORD: z.string().min( 8 ),

    DATABASE_URL: z.url(),
} );


export type EnvVariables = z.infer<typeof envSchema>;


export function loadEnv (): EnvVariables {
    return envSchema.parse( process.env );
}
```

## Configuración abstracta del server

Este fragmento define una clase abstracta `ConfigServer` que centraliza la carga y acceso seguro a variables de entorno en un proyecto backend. Utiliza `dotenv` para cargar el archivo `.env` correspondiente según el valor de `NODE_ENV`, construyendo dinámicamente su ruta con `createPathEnv` (por ejemplo, `.development.env`). Luego, valida y tipa las variables mediante `loadEnv`, basado en el esquema definido con Zod. La clase expone métodos protegidos para obtener valores (`getEnvironment`) o convertirlos a número (`getNumberEnv`), lo que facilita la reutilización en clases hijas sin comprometer la integridad del entorno. Esta estructura modular y tipada es ideal para documentar en guías institucionales sobre scaffolding backend, ya que promueve seguridad, claridad y escalabilidad en la configuración de servicios.

```ts showLineNumbers title="src/config/ConfigServer.ts"
import * as dotenv from "dotenv";
import { EnvVariables, loadEnv } from "./env.config";

export abstract class ConfigServer {
    public readonly env: EnvVariables;

    constructor () {
        const nodeNameEnv: string = this.createPathEnv( this.nodeEnv );
        dotenv.config( {
            path: nodeNameEnv
        } );
        this.env = loadEnv();
    }

    protected getEnvironment ( key: keyof typeof this.env ): string | number {
        return this.env[ key ];
    }

    protected getNumberEnv ( key: keyof typeof this.env ): number {
        return Number( this.env[ key ] );
    }

    protected get nodeEnv (): string {
        return process.env[ 'NODE_ENV' ]?.trim() || '';
    }

    protected get databaseUrl (): string {
        return this.getEnvironment( "DATABASE_URL" ).toString();
    }

    protected createPathEnv ( path: string ): string {
        const arrEnv: string[] = [ 'env' ];

        if ( path.length ) {
            const stringToArray: string[] = path.split( '.' );
            arrEnv.unshift( ...stringToArray );
        }

        return `.${ arrEnv.join( '.' ) }`;
    }
}
```

## Configuración de logger

Este fragmento define una función `createLogger` que configura y retorna una instancia de `pino`, una librería de logging eficiente para Node.js, adaptada al entorno de ejecución. Utiliza el tipo `EnvVariables` para acceder a `NODE_ENV` y establecer el nivel de log: en producción se usa `"info"` para registrar solo eventos relevantes, mientras que en desarrollo se activa `"debug"` para mayor detalle. Además, en entornos no productivos se habilita el transporte `pino-pretty`, que mejora la legibilidad de los logs en consola. Esta configuración modular y contextualizada es ideal para documentar en guías institucionales sobre observabilidad y buenas prácticas en scaffolding backend.

```ts showLineNumbers title="src/config/logger.ts"
import pino from 'pino';
import { EnvVariables } from './env.config';

export function createLogger ( env: EnvVariables ): pino.Logger {
    return pino( {
        level: env.NODE_ENV === 'production' 
            ? 'info' 
            : 'debug',
        transport: env.NODE_ENV === 'production' 
            ? undefined 
            : {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: "SYS:standard"
              }
            },
    } );
}

```

## Configuración inicial del bootstrap

Este fragmento define la clase `ServerBootstrap`, que extiende la configuración base de `ConfigServer` para inicializar y ejecutar un servidor Express con buenas prácticas en scaffolding backend. En su constructor, carga el puerto desde las variables de entorno, crea un logger con `pino` adaptado al entorno (`development`, `production`, etc.), y configura middlewares esenciales: `express.json()` para recibir datos en formato JSON, `express.urlencoded()` para formularios, `morgan` para registrar peticiones HTTP en consola, y `cors()` para habilitar solicitudes entre dominios. Finalmente, el método `listen()` arranca el servidor y registra en consola el puerto y el entorno activo. Aunque el método `_routers` está definido, aún no se integran rutas, lo que sugiere que esta clase está preparada para escalar modularmente. Esta estructura es ideal para documentar en guías institucionales sobre arquitectura limpia y servidores backend sostenibles.

```ts showLineNumbers title="src/config/ServerBootstrap.ts"
import cors from "cors";
import express, { Application, Router } from "express";
import morgan from "morgan";
import pino from "pino";
import { prismaClient } from "../infrastructure/db/prisma";
import { ConfigServer } from "./ConfigServer";
import { createLogger } from "./logger";

export class ServerBootstrap extends ConfigServer {
    private _app: Application = express();
    private _port: number;
    private _logger: pino.Logger;

    constructor () {
        super();

        this._port = this.getNumberEnv( "PORT" );
        this._logger = createLogger( this.env );

        this.configureMiddleware();

        this._app.use( "/api", ...this._routers() );

        this.listen();
    }

    private configureMiddleware (): void {
        this._app.use( express.json() );
        this._app.use( express.urlencoded( { extended: true } ) );
        this._app.use( cors() );
        this._app.use( morgan( "dev" ) );
    }

    public listen (): void {
        this._app.listen( this._port, async () => {
            this._logger.info( `Server listen on port: ${ this._port } in ${ this.getEnvironment( "NODE_ENV" ) } mode` );
            this._logger.info( `http://localhost:${ this._port }` );

            await this.dbConnection();
        } );
    }

    private async dbConnection (): Promise<void> {
        try {
            await prismaClient.$connect();
            this._logger.info( "Prisma connected to the database" );
        } catch ( error ) {
            this._logger.error( {
                msg: "Error connecting Prisma to the database",
                error: error instanceof Error ? error.message : String( error ),
                stack: error instanceof Error ? error.stack : undefined,
            } );
            throw error;
        }
    }

    private _routers = (): Router[] => {
        return [];
    };
}
```

## Configurar Prisma Client

Este fragmento inicializa el cliente de Prisma en el proyecto, importándolo desde una ruta personalizada (`../../../prisma/generated/prisma`) que indica que el cliente fue generado en una ubicación específica mediante el comando `prisma generate`. La constante `prismaClient` representa una instancia única de `PrismaClient`, que se utiliza para interactuar con la base de datos PostgreSQL definida en el esquema. Esta instancia permite realizar operaciones como consultas, inserciones y actualizaciones de forma tipada y segura. Centralizar esta configuración en `src/infrastructure/db/prisma.ts` facilita su reutilización en toda la aplicación y promueve una arquitectura limpia, ideal para documentar en guías institucionales sobre acceso a datos y scaffolding backend.

```ts showLineNumbers title="src/infrastructure/db/prisma.ts"
import { PrismaClient } from "../../../prisma/generated/prisma";

export const prismaClient = new PrismaClient();
```

Este fragmento amplía la clase `ServerBootstrap` para establecer una conexión segura con la base de datos al iniciar el servidor. Dentro del método `listen()`, se invoca `dbConnection()` de forma asíncrona justo después de que Express comienza a escuchar en el puerto configurado, asegurando que la base de datos esté disponible antes de continuar con la ejecución. El método `dbConnection()` utiliza el cliente de Prisma (`prismaClient`) para conectarse a la base de datos PostgreSQL, registrando un mensaje informativo si la conexión es exitosa o un error si falla, lo que facilita la trazabilidad y el diagnóstico. Esta integración refuerza la arquitectura limpia del proyecto y es ideal para documentar en guías institucionales sobre inicialización de servicios y observabilidad en scaffolding backend.

```ts showLineNumbers title="src/config/ServerBootstrap.ts"
import { prismaClient } from '../infrastructure/db/prisma';
...

export class ServerBootstrap extends ConfigServer {
    ...
    public listen (): void {
        this._app.listen( this._port, async () => {
            ...
            await this.dbConnection();
        } );
    }

    private async dbConnection (): Promise<void> {
        try {
            await prismaClient.$connect();
            this._logger.info( "Prisma connected to the database" );
        } catch ( error ) {
            this._logger.error( "Error connecting Prisma to the database" );
            throw error;
        }
    }
}
```

Este fragmento implementa un manejo seguro del ciclo de vida de la aplicación backend, asegurando que Prisma se desconecte correctamente de la base de datos cuando el proceso reciba señales de terminación (`SIGINT` o `SIGTERM`), como al detener el servidor manualmente o durante despliegues. Primero se cargan las variables de entorno con `loadEnv` y se configura el logger con `createLogger`, ambos adaptados al entorno activo. Luego, se definen listeners para las señales del sistema: al capturar `SIGINT` (interrupción) o `SIGTERM` (terminación), se ejecuta `prismaClient.$disconnect()` para liberar la conexión, se registra el evento en consola y se finaliza el proceso con `process.exit(0)`. Esta práctica refuerza la estabilidad y trazabilidad del backend, y es clave para documentar en guías institucionales sobre observabilidad y cierre controlado de servicios en entornos productivos.

```ts showLineNumbers title="src/main.ts"
export class ServerBootstrap extends ConfigServer {
    ...
    constructor () {
        ....
        this.handleShutdown();
    }
    ...
    private handleShutdown (): void {
        process.on( "SIGINT", async () => {
            await prismaClient.$disconnect();
            this._logger.info( "Prisma disconnected on SIGINT" );
            process.exit( 0 );
        } );
        process.on( "SIGTERM", async () => {
            await prismaClient.$disconnect();
            this._logger.info( "Prisma disconnected on SIGTERM" );
            process.exit( 0 );
        } );

    }
}
```

## Refactor en logs

Este fragmento define la función `createLogger`, que configura una instancia de `pino` para registrar eventos del backend de forma eficiente y contextualizada según el entorno (`NODE_ENV`). En producción, se establece el nivel de log en `"info"` y se omite el transporte adicional para maximizar el rendimiento. En desarrollo o pruebas, se habilita un transporte con múltiples destinos: los logs de nivel `"info"` y `"error"` se escriben tanto en archivos (`./logs/actions.log` y `./logs/errors.log`) como en consola con formato legible (`pino-pretty`), incluyendo colores y marcas de tiempo estándar. Esta configuración modular mejora la observabilidad, facilita el diagnóstico y es ideal para documentar en guías institucionales sobre logging profesional y scaffolding backend sostenible.

```ts showLineNumbers title="src/config/logger.ts"
import pino from 'pino';
import { EnvVariables } from './env.config';

export function createLogger ( env: EnvVariables ): pino.Logger {
    return pino( {
        level: env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: env.NODE_ENV === 'production' ? undefined : {
            targets: [
                {
                    level: "info",
                    target: 'pino/file',
                    options: {
                        destination: "./logs/actions.log",
                        mkdir: true
                    }
                },
                {
                    level: "info",
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: "SYS:standard"
                    }
                },
                {
                    level: "error",
                    target: "pino/file",
                    options: {
                        destination: "./logs/errors.log",
                        mkdir: true
                    }
                },
                {
                    level: "error",
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: "SYS:standard"
                    }
                },
            ]
        },
    } );
}
```

Este fragmento refuerza la trazabilidad y el manejo profesional de errores al conectar Prisma con la base de datos dentro de la clase `ServerBootstrap`. El método `dbConnection()` intenta establecer la conexión mediante `prismaClient.$connect()` y, en caso de éxito, registra un mensaje informativo. Si ocurre una excepción, captura el error, lo transforma en un objeto estructurado con mensaje, descripción y stack trace (si está disponible), y lo registra con nivel `"error"` usando el logger configurado. Esta práctica permite diagnósticos precisos y facilita la observabilidad en entornos productivos, siendo un ejemplo replicable para documentar en guías institucionales sobre scaffolding backend y arquitectura limpia.

```ts showLineNumbers title="src/config/ServerBootstrap.ts"
export class ServerBootstrap extends ConfigServer {
    ...
    private async dbConnection (): Promise<void> {
        try {
            await prismaClient.$connect();
            this._logger.info( "Prisma connected to the database" );
        } catch ( error ) {
            this._logger.error( {
                msg: "Error connecting Prisma to the database",
                error: error instanceof Error ? error.message : String( error ),
                stack: error instanceof Error ? error.stack : undefined
            } );
            throw error;
        }
    }
}
```

## Ajuste del Reloj del sistema

Este fragmento aplica el patrón **Strategy**, al definir la interfaz `Clock` como contrato para obtener la fecha actual, y proveer dos implementaciones: `SystemClock`, que retorna la hora del sistema, y `LocalClock`, que ajusta manualmente la hora a la zona horaria de Colombia (UTC-5). Esta abstracción permite desacoplar el origen del tiempo del resto de la lógica de negocio, facilitando pruebas, simulaciones y adaptaciones regionales. Es ideal para documentar en guías institucionales sobre inyección de dependencias, control temporal y sostenibilidad técnica en backend.

```ts showLineNumbers title="src/application/ports/Clock.ts"
export interface Clock {
    now (): Date;
}

export class SystemClock implements Clock {
    now (): Date {
        return new Date();
    }
}

export class LocalClock implements Clock {
    now (): Date {
        const utcNow = new Date();

        const colombiaTime = new Date( utcNow.getTime() - 5 * 60 * 60 * 1000 );

        return colombiaTime;
    }
}
```

## Entidades

Este fragmento define una clase abstracta `BaseEntity` que sirve como entidad base para modelos de dominio en una arquitectura orientada a objetos. Utiliza un tipo genérico `IdType` (por defecto `string`) para representar el identificador único de cada entidad, junto con una marca de tiempo `createdAt` que se asigna automáticamente al momento de instanciación. Además, incluye el método `equals`, que permite comparar dos entidades por su `id`, facilitando la lógica de igualdad en el dominio sin depender de referencias de memoria. Esta abstracción promueve consistencia, trazabilidad y reutilización en el diseño de entidades, siendo ideal para documentar en guías institucionales sobre modelado estratégico y arquitectura limpia.

```ts showLineNumbers title="src/domain/entities/BaseEntity.ts"
export abstract class BaseEntity<IdType = string> {
    constructor (
        public readonly id: IdType,
        public readonly createdAt: Date = new Date()
    ) { }

    public equals ( entity?: BaseEntity<IdType> ): boolean {
        if ( !entity ) return false;
        return this.id === entity.id;
    }
}
```

Este fragmento define los *value objects* `TicketStatus` y `TicketPriority` como arreglos constantes con sus respectivos tipos derivados, lo que garantiza que los valores permitidos para estado y prioridad de un ticket estén restringidos y tipados de forma segura. Esta estrategia mejora la semántica del dominio, evita errores por valores arbitrarios y facilita validaciones tanto en DTOs como en entidades, siendo clave para documentar buenas prácticas en modelado estratégico dentro de arquitecturas limpias.

```ts showLineNumbers title="src/domain/value-objects/Status.ts"
export const TicketStatus = [ 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED' ] as const;

export type TicketStatus = ( typeof TicketStatus )[ number ];


export const TicketPriority = [ 'LOW', 'MEDIUM', 'HIGH', 'URGENT' ] as const;

export type TicketPriority = ( typeof TicketPriority )[ number ];
```

Este fragmento define los esquemas `ZTicketStatus` y `ZTicketPriority` usando `zod.enum`, a partir de los arreglos constantes previamente tipados en `Status.ts`. Esta integración permite validar de forma declarativa y segura los valores de estado y prioridad de un ticket, asegurando que solo se acepten opciones válidas en flujos como DTOs, controladores o pruebas. Es una práctica clave para reforzar la coherencia entre el dominio y la validación, ideal para documentar en guías institucionales sobre validación semántica y sostenibilidad técnica en backend.

```ts showLineNumbers title="src/domain/value-objects/status.zod.ts"
import { z } from "zod";
import { TicketPriority, TicketStatus } from "./Status";

export const ZTicketStatus = z.enum(TicketStatus);
export const ZTicketPriority = z.enum(TicketPriority);
```

Este fragmento define el *value object* `TicketId`, una clase que encapsula el identificador único de un ticket en el dominio, siguiendo principios de diseño orientado a objetos y arquitectura limpia. Utiliza `randomUUID` del módulo `crypto` para generar identificadores seguros y no predecibles mediante el método estático `new()`, mientras que `from(value)` permite construir una instancia a partir de un string existente (por ejemplo, al reconstruir desde la base de datos). El constructor es privado para garantizar que todas las instancias se creen de forma controlada, y el método `toString()` expone el valor encapsulado. Esta abstracción mejora la trazabilidad, evita errores por uso de strings arbitrarios y es ideal para documentar en guías institucionales sobre modelado estratégico y consistencia semántica en el backend.

```ts showLineNumbers title="src/domain/value-objects/TicketId.ts"
import { randomUUID } from 'node:crypto';

export class TicketId {
    private constructor(private readonly value: string) {}

    static new(): TicketId {
        return new TicketId(randomUUID());
    }

    static from(value: string): TicketId {
        return new TicketId(value);
    }

    toString(): string {
        return this.value;
    }
}
```

Este fragmento define tres esquemas Zod (`CreateTicketSchema`, `TicketSchema` y `RehydrateTicketSchema`) que validan la estructura y tipos de datos en distintos momentos del ciclo de vida de un ticket: creación, representación completa y rehidratación desde persistencia. Cada esquema garantiza integridad semántica mediante validaciones explícitas (UUIDs, fechas, strings mínimas) y reutiliza los enums tipados `ZTicketStatus` y `ZTicketPriority` para asegurar coherencia con el dominio. Esta estrategia fortalece la trazabilidad, facilita el scaffolding seguro y es ideal para documentar en guías institucionales sobre validación declarativa y sostenibilidad técnica en backend.

```ts showLineNumbers title="src/application/dtos/ticket.ts"
import { z } from "zod";
import { ZTicketPriority, ZTicketStatus } from "../../domain/value-objects/status.zod";

export const CreateTicketSchema = z.object({
    title: z.string().trim().min(3),
    priority: ZTicketPriority,
    userId: z.uuidv4(),
    areaId: z.uuidv4(),
    createdAt: z.date().optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

export const TicketSchema = z.object({
    id: z.uuidv4(),
    title: z.string().trim(),
    status: ZTicketStatus,
    priority: ZTicketPriority,
    userId: z.uuidv4(),
    areaId: z.uuidv4(),
    createdAt: z.date(),
});

export type TicketDto = z.infer<typeof TicketSchema>;

export const RehydrateTicketSchema = z.object({
    id: z.uuidv4(),
    title: z.string().trim(),
    status: ZTicketStatus,
    priority: ZTicketPriority,
    userId: z.uuidv4(),
    areaId: z.uuidv4(),
    createdAt: z.date(),
});

export type RehydrateTicketDto = z.infer<typeof RehydrateTicketSchema>;
```

Esta clase `Ticket` representa una entidad del dominio que extiende `BaseEntity` y encapsula los atributos clave de un ticket, como título, estado, prioridad, usuario y área asociada. Utiliza el *value object* `TicketId` para garantizar la identidad semántica, y expone un método estático `create` que construye la entidad a partir de un `CreateTicketDTO`, asegurando trazabilidad, consistencia tipada y alineación con las reglas del dominio. Esta implementación es ideal para documentar en guías institucionales sobre modelado estratégico y construcción controlada de entidades en arquitecturas limpias.

```ts showLineNumbers title="src/domain/entities/Ticket.ts"
import { CreateTicketInput, RehydrateTicketDto } from "../../application/dtos/ticket";
import { TicketPriority, TicketStatus } from "../value-objects/Status";
import { TicketId } from "../value-objects/TicketId";
import { BaseEntity } from "./BaseEntity";

export class Ticket extends BaseEntity<TicketId> {
    private constructor(
        id: TicketId,
        public title: string,
        public status: TicketStatus,
        public priority: TicketPriority,
        public readonly userId: string,
        public readonly areaId: string,
        createdAt: Date,
    ) {
        super(id, createdAt);
    }

    public static create(dto: CreateTicketInput, now: Date): Ticket {
        return new Ticket(
            TicketId.new(),
            dto.title,
            "OPEN",
            dto.priority,
            dto.userId,
            dto.areaId,
            dto.createdAt ?? now,
        );
    }

    public static rehydrate(row: RehydrateTicketDto): Ticket {
        return new Ticket(
            TicketId.from(row.id),
            row.title,
            row.status,
            row.priority,
            row.userId,
            row.areaId,
            new Date(row.createdAt),
        );
    }
}
```

## Servicio de transición de estados en tickets

Este fragmento implementa una máquina de estados para tickets, definiendo transiciones válidas entre estados mediante el objeto `ALLOWED`. Cada clave representa un estado actual (`from`) y su arreglo asociado indica los estados permitidos a los que puede avanzar (`to`). La función `canTransition` evalúa si una transición específica es válida, reforzando las reglas del dominio de forma explícita y tipada. Esta lógica es ideal para documentar en guías institucionales sobre consistencia semántica, control de flujo de negocio y sostenibilidad técnica en backend.

```ts showLineNumbers title="src/domain/services/TicketStateMachine.ts"
import { TicketStatus } from '../value-objects/Status';

const ALLOWED: Record<TicketStatus, TicketStatus[]> = {
    OPEN: [ "ASSIGNED", "CANCELLED" ],
    ASSIGNED: [ "IN_PROGRESS", "CANCELLED" ],
    IN_PROGRESS: [ "RESOLVED", "CANCELLED" ],
    RESOLVED: [ "CLOSED" ],
    CLOSED: [],
    CANCELLED: []
};

export const canTransition = ( from: TicketStatus, to: TicketStatus ): boolean => ALLOWED[ from ].includes( to );
};
```

## Repositorio Puerto para Ticket

Este fragmento define el contrato `TicketRepository`, una interfaz que aplica el patrón de diseño **Repository**, clave en arquitecturas limpias para desacoplar la lógica de persistencia del dominio. Expone tres operaciones esenciales: `save` para almacenar o actualizar un ticket, `findById` para recuperar uno por su identificador, y `list` para obtener todos los tickets. Este diseño permite que la lógica de negocio trabaje con entidades puras (`Ticket`) sin preocuparse por detalles de infraestructura, facilitando pruebas, escalabilidad y documentación institucional sobre separación de responsabilidades y sostenibilidad técnica.

```ts showLineNumbers title="src/application/ports/TicketRepository.ts"
import { Ticket } from "../../domain/entities/Ticket";

export interface TicketRepository {
    save ( ticket: Ticket ): Promise<void>;
    findById ( id: string ): Promise<Ticket | null>;
    list (): Promise<Ticket[]>;
}
```

## Implementación de repositorio para Ticket

Este fragmento implementa el patrón **Repository** en la clase `PrismaTicketRepository`, desacoplando la lógica de persistencia del dominio mediante Prisma. La operación `save` utiliza `upsert` para crear o actualizar un ticket según su `id`, garantizando idempotencia y eficiencia. Los métodos `findById` y `list` recuperan datos desde la base y los rehidratan como entidades de dominio (`Ticket`) usando el DTO `RehydrateTicketDto`, preservando la semántica del modelo. Esta implementación promueve sostenibilidad técnica, trazabilidad y claridad arquitectónica, siendo ejemplar para documentar en guías institucionales sobre integración de infraestructura con entidades puras.

```ts showLineNumbers title="src/infrastructure/repositories/PrismaTicketRepository.ts"
import { RehydrateTicketDto } from "../../application/dtos/ticket";
import { TicketRepository } from "../../application/ports/TicketRepository";
import { Ticket } from "../../domain/entities/Ticket";
import { prismaClient } from "../db/prisma";

export class PrismaTicketRepository implements TicketRepository {
    async save ( ticket: Ticket ): Promise<void> {
        await prismaClient.ticket.upsert( {
            where: { id: ticket.id.toString() },
            create: {
                id: ticket.id.toString(),
                title: ticket.title,
                status: ticket.status,
                priority: ticket.priority,
                userId: ticket.userId,
                areaId: ticket.areaId,
            },
            update: {
                title: ticket.title,
                status: ticket.status,
                priority: ticket.priority,
            },
        } );
    }

    async findById ( id: string ): Promise<Ticket | null> {
        const row = await prismaClient.ticket.findUnique( {
            where: { id },
        } );

        return row ? Ticket.rehydrate( row as RehydrateTicketDto ) : null;
    }

    async list (): Promise<Ticket[]> {
        const rows = await prismaClient.ticket.findMany( {
            orderBy: { createdAt: "desc" },
        } );

        return rows.map( ( row ) => Ticket.rehydrate( row as RehydrateTicketDto ) );
    }
}
```

## Event Bus

Este fragmento define la interfaz `EventBus`, aplicando el patrón de diseño **Event Bus** o **Message Bus**, común en arquitecturas orientadas a eventos. Su propósito es desacoplar la emisión de eventos del manejo de sus efectos, permitiendo que componentes del sistema reaccionen de forma asíncrona y distribuida. Al recibir un `DomainEvent`, el método `publish` lo propaga sin requerir conocimiento de los suscriptores, lo que favorece la extensibilidad, la trazabilidad de acciones del dominio y la integración con mecanismos como colas, logs o listeners. Es ideal para documentar en guías institucionales sobre eventos de dominio y separación de responsabilidades.

```ts showLineNumbers title="src/application/ports/EventBus.ts"
import { DomainEvent } from "../../domain/events/DomainEvent";

export interface EventBus {
    publishAll ( event: DomainEvent[] ): Promise<void>;
}
```

Este fragmento define el evento de dominio `TicketCreated`, aplicando el patrón **Domain Event**, fundamental en arquitecturas orientadas a eventos. Extiende la interfaz `DomainEvent` y especifica el tipo `"ticket.created"` junto con un `payload` que encapsula los datos relevantes del ticket recién creado. Esta estructura permite comunicar cambios significativos en el estado del sistema de forma desacoplada, facilitando la integración con un `EventBus`, la trazabilidad de acciones y la reacción de otros componentes sin acoplamiento directo. Es ideal para documentar en guías institucionales sobre eventos de negocio, consistencia semántica y diseño reactivo en backend.

```ts showLineNumbers title="src/domain/events/TicketCreated.ts"
import { DomainEvent } from "./DomainEvent";

export interface TicketCreated extends DomainEvent {
    type: "ticket.created";
    payload: {
        id: string;
        title: string;
        userId: string;
        areaId: string;
    };
}
```

## Refactor para publicación de eventos

Este fragmento aplica el patrón **Domain Event** dentro de una entidad base (`BaseEntity`), permitiendo que cualquier entidad del dominio registre eventos relevantes mediante `recordEvent(event)` y los exponga temporalmente con `pullDomainEvents()`. Esta estrategia promueve trazabilidad, desacoplamiento y reactividad en sistemas orientados a eventos, al permitir que las entidades comuniquen cambios sin depender directamente de servicios externos. Es especialmente útil para documentar en guías institucionales sobre diseño estratégico de entidades, propagación de eventos y consistencia semántica en arquitecturas limpias.

```ts showLineNumbers title="src/domain/entities/BaseEntity.ts"
import { DomainEvent } from "../events/DomainEvent";

export abstract class BaseEntity<IdType = string> {
    public readonly _domainEvents: DomainEvent[] = [];
    ...
    protected recordEvent ( event: DomainEvent ): void {
        this._domainEvents.push( event );
    }

    public pullDomainEvents (): DomainEvent[] {
        const events = [ ...this._domainEvents ];
        this._domainEvents.length = 0;
        return events;
    }
}
```

Este fragmento refuerza el patrón **Domain Event** al registrar explícitamente un evento significativo (`ticket.created`) dentro del método `create` de la entidad `Ticket`. Al construir el evento con `occurredAt` y un `payload` contextual, y luego invocando `recordEvent`, se garantiza que la creación del ticket no solo modifica el estado del sistema, sino que también deja una traza semántica que puede ser publicada, auditada o procesada por otros componentes. Esta práctica potencia la trazabilidad, el desacoplamiento y la reactividad del sistema, y es ejemplar para documentar en guías institucionales sobre diseño orientado a eventos y consistencia semántica en el dominio.

```ts showLineNumbers
import { DomainEvent } from '../events/DomainEvent';
...
export class Ticket extends BaseEntity<TicketId> {
    ...
    public static create ( dto: CreateTicketInput, now: Date ): Ticket {
        const ticket = new Ticket(...);

        const event: DomainEvent = {
            type: "ticket.created",
            occurredAt: now,
            payload: {
                id: ticket.id.toString(),
                title: ticket.title,
                userId: ticket.userId,
                areaId: ticket.areaId
            }
        };

        ticket.recordEvent( event );

        return ticket;
    }
    ...
}
```

## Casos de uso

Este fragmento implementa el caso de uso `CreateTicket`, aplicando los principios de arquitectura limpia y varios patrones de diseño clave. Coordina la creación de una entidad `Ticket` con ayuda de un `Clock` (patrón **Strategy**), persiste la entidad mediante un `TicketRepository` (patrón **Repository**) y publica sus eventos de dominio a través de un `EventBus` (patrón **Event Bus**). Esta orquestación encapsula la lógica de negocio de forma clara, trazable y desacoplada, ideal para documentar en guías institucionales sobre sostenibilidad técnica, separación de responsabilidades y diseño orientado a eventos.

```ts showLineNumbers title="src/application/use-cases/CreateTicket.ts"
import { Ticket } from "../../domain/entities/Ticket";
import { CreateTicketInput, CreateTicketSchema } from "../dtos/ticket";
import { Clock } from "../ports/Clock";
import { EventBus } from "../ports/EventBus";
import { TicketRepository } from "../ports/TicketRepository";

export class CreateTicket {
    constructor (
        private readonly repo: TicketRepository,
        private readonly clock: Clock,
        private readonly bus: EventBus,
    ) { }


    async execute ( input: CreateTicketInput ): Promise<Ticket> {
        const ticket = Ticket.create(
            CreateTicketSchema.parse( input ),
            this.clock.now()
        );
        await this.repo.save( ticket );

        const events = ticket.pullDomainEvents();
        await this.bus.publishAll( events );

        return ticket;
    }
}
```

## Mapear entidad a objeto para manejo en peticiones HTTP

Este fragmento implementa el mapeo `toHttp`, que transforma una entidad de dominio `Ticket` en un objeto plano listo para ser serializado en respuestas HTTP. Aplica el patrón **Mapper**, clave para desacoplar el modelo interno del formato expuesto externamente, preservando la semántica del dominio (`TicketId`, `status`, `priority`) mientras se adapta a las convenciones del transporte. Esta práctica promueve claridad, trazabilidad y sostenibilidad técnica, siendo ideal para documentar en guías institucionales sobre interfaces limpias y separación de capas.

```ts showLineNumbers title="src/interfaces/mappers/TicketMapper.ts"
import { Ticket } from "../../domain/entities/Ticket";

export const toHttp = ( ticket: Ticket ) => ( {
    id: ticket.id.toString(),
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    userId: ticket.userId,
    areaId: ticket.areaId,
    createdAt: ticket.createdAt,
} );
```

## Controlador HTTP

Este controlador `TicketsController` aplica el patrón **Controller** dentro de una arquitectura limpia, actuando como punto de entrada HTTP para la creación de tickets. Valida la entrada con `CreateTicketSchema` (usando Zod), delega la lógica de negocio al caso de uso `CreateTicket`, y transforma la entidad resultante con `toHttp` antes de responder. Esta estructura promueve separación de responsabilidades, trazabilidad y validación declarativa, siendo ejemplar para documentar en guías institucionales sobre diseño de interfaces HTTP limpias y sostenibles.

```ts showLineNumbers title="src/interfaces/http/controllers/TicketsController.ts"
import { Request, Response } from "express";
import z from "zod";
import { CreateTicketSchema } from "../../../application/dtos/ticket";
import { CreateTicket } from "../../../application/use-cases/CreateTicket";
import { toHttp } from "../../mappers/TicketMapper";

export class TicketsController {
    constructor ( private readonly createTicket: CreateTicket ) { }

    create = async ( req: Request, res: Response ): Promise<unknown> => {
        const parsed = CreateTicketSchema.safeParse( req.body );

        if ( !parsed.success ) {
            return res.status( 400 ).json( {
                errors: z.treeifyError( parsed.error )
            } );
        }

        const ticket = await this.createTicket.execute( parsed.data );

        res.status( 201 ).json( toHttp( ticket ) );
    };

    list = async ( req: Request, res: Response ): Promise<void> => {
        res.status( 501 ).json( { message: "Not implemented" } );
    };
}
```

## Tests unitarios

Previo a hacer los test, debemos ajustar la validación de los id para que no se validen por Zod como UUID sino como string:

```ts showLineNumbers title="src/application/dtos/ticket.ts"
export const CreateTicketSchema = z.object( {
    title: z.string().trim().min( 3 ),
    priority: ZTicketPriority,
    // userId: z.uuidv4(),
    userId: z.string(),
    // areaId: z.uuidv4(),
    areaId: z.string(),
    createdAt: z.date().optional(),
} );
```

Este código es una suite de pruebas unitarias para el caso de uso `CreateTicket`, escrita con Vitest. Se utilizan dobles de prueba (`InMemoryRepo`, `FakeClock`, `FakeBus`) para simular el repositorio, el reloj y el bus de eventos, permitiendo validar el comportamiento del caso de uso en aislamiento. El método `beforeEach` garantiza que cada prueba comience con instancias limpias, evitando efectos colaterales entre tests.

Las pruebas verifican que al ejecutar `CreateTicket`, el ticket se crea con estado `"OPEN"`, se guarda correctamente en el repositorio, y se publica un evento de dominio con tipo `"ticket.created"` y un `payload` esperado. También se valida que el evento tenga la marca de tiempo proporcionada por el `FakeClock`, que los eventos se drenan después de publicarse, y que los errores de validación (como título vacío o prioridad inválida) se propagan correctamente.

Este enfoque promueve trazabilidad, testabilidad y sostenibilidad técnica, y puede servir como plantilla institucional para semilleros. Refuerza principios de arquitectura limpia, separación de responsabilidades y diseño orientado a eventos, todo dentro de un entorno controlado y reproducible.

```ts showLineNumbers title="tests/unit/createTicket.test.ts"
import { describe, it, expect, beforeEach } from "vitest";
import { CreateTicket } from "../../src/application/use-cases/CreateTicket";

class InMemoryRepo {
    items: any[] = [];

    async save ( ticket: unknown ): Promise<void> {
        this.items.push( ticket );
    }

    async findById (): Promise<null> {
        return null;
    }

    async list (): Promise<any[]> {
        return this.items;
    }
}

class FakeClock {
    now (): Date {
        return new Date( "2025-01-01T00:00:00Z" );
    }
}

class FakeBus {
    public published: any[] = [];

    async publishAll ( events: unknown[] ): Promise<void> {
        this.published.push( ...events );
    }
}

describe( "CreateTicket use case", (): void => {
    let repo: InMemoryRepo;
    let clock: FakeClock;
    let bus: FakeBus;
    let useCase: CreateTicket;

    const input = {
        title: "Printer down",
        priority: "HIGH",
        userId: "u1",
        areaId: "a1"
    } as const;

    beforeEach( () => {
        repo = new InMemoryRepo();
        clock = new FakeClock();
        bus = new FakeBus();
        useCase = new CreateTicket(
            repo as any, clock as any, bus as any
        );
    } );

    it( "sets ticket status as OPEN", async (): Promise<void> => {
        const ticket = await useCase.execute( input );
        expect( ticket.status ).toBe( "OPEN" );
    } );

    it( "persists the ticket in the repository", async (): Promise<void> => {
        await useCase.execute( input );
        const all = await repo.list();
        expect( all ).toHaveLength( 1 );
        expect( all.at( 0 ) ).toMatchObject( {
            title: "Printer down",
            priority: "HIGH",
            userId: "u1",
            areaId: "a1",
            status: "OPEN"
        } );
    } );

    it( "publishes exactly one domain event", async (): Promise<void> => {
        await useCase.execute( input );
        expect( bus.published ).toHaveLength( 1 );
    } );

    it( "publishes a ticket.created event with the expected payload", async (): Promise<void> => {
        const ticket = await useCase.execute( input );
        const [ event ] = bus.published;

        expect( event ).toMatchObject( {
            type: "ticket.created",
            occurredAt: new Date( "2025-01-01T00:00:00Z" ),
            payload: {
                id: ticket.id.toString(),
                title: "Printer down",
                userId: "u1",
                areaId: "a1"
            }
        } );
    } );

    it( "uses the provided clock to timestamp the event", async (): Promise<void> => {
        await useCase.execute( input );
        const [ event ] = bus.published;
        expect( event.occurredAt ).toEqual( new Date( "2025-01-01T00:00:00Z" ) );
    } );

    it( "drains domain events from the entity after publishing", async (): Promise<void> => {
        const ticket = await useCase.execute( input );
        expect( ticket.pullDomainEvents() ).toHaveLength( 0 );
    } );

    it( "throws if title is blank (validation propagates)", async (): Promise<void> => {
        await expect(
            useCase.execute( { ...input, title: "   " } as any )
        ).rejects.toThrow();
    } );

    it( "throws if priority is invalid", async (): Promise<void> => {
        await expect(
            useCase.execute( { ...input, priority: "INVALID" } as any )
        ).rejects.toThrow();
    } );
} );
```

## Middleware de validación con Zod

Este middleware `BaseMiddleware` implementa una función genérica de validación para rutas HTTP en Express, utilizando el esquema de Zod. Su método validate recibe dos parámetros:

- `where`: indica la ubicación del dato a validar (body, query o params),
- `schema`: un esquema Zod que define la forma esperada de los datos.

La función interna ejecuta safeParse sobre la sección correspondiente del objeto req. Si la validación falla, responde con un 400 Bad Request y un árbol de errores estructurado (z.treeifyError). Si es exitosa, sobrescribe los datos originales con los datos validados (result.data) y continúa con next().

```ts showLineNumbers title="src/interfaces/http/middlewares/validate.ts"
import type { RequestHandler } from "express";
import { z, type ZodType } from "zod";

type Where = "body" | "query" | "params";

export class BaseMiddleware {
    public validate = ( where: Where, schema: ZodType ): RequestHandler => {
        return ( req, res, next ) => {
            const result = schema.safeParse( ( req as any )[ where ] );

            if ( !result.success ) {
                return res.status( 400 ).json( { errors: z.treeifyError( result.error ) } );
            }
  
            Object.assign( ( req as any )[ where ], result.data );

            next();
        };
    };
}
```

## Rutas

Este fragmento define una clase genérica `BaseRouter<C, M>` que sirve como plantilla para construir routers HTTP en Express, siguiendo principios de modularidad y reutilización. Utiliza generics (`C` para el controlador y `M` para el middleware) para permitir flexibilidad tipada en la implementación de rutas específicas.

Al instanciarse, la clase crea un nuevo Router de Express, guarda las referencias al controlador y middleware, y llama al método routes(), que está diseñado para ser sobrescrito por subclases. Esta estructura permite que cada router especializado defina sus propias rutas dentro de routes(), manteniendo una arquitectura limpia, trazable y desacoplada.

```ts showLineNumbers title="src/interfaces/http/base/BaseRouter.ts"
import { Router } from "express";

export class BaseRouter<C, M> {
    public router: Router;
    protected controller: C;
    protected middleware: M;

    constructor ( controller: C, middleware: M ) {
        this.router = Router();
        this.controller = controller;
        this.middleware = middleware;

        this.routes();
    }

    protected routes (): void { }
}
```

Este fragmento define la clase `TicketsRouter`, una especialización de BaseRouter que encapsula las rutas HTTP relacionadas con tickets en una API Express. Aplica principios de arquitectura limpia y desacoplamiento, conectando el controlador `TicketsController` con el middleware `BaseMiddleware` de validación, sin acoplarse directamente a Express.

Dentro del método sobrescrito routes(), se configuran dos rutas:

- `POST /`: crea un ticket. Antes de ejecutar el controlador, se valida el cuerpo (`body`) de la solicitud con `CreateTicketSchema`, garantizando integridad semántica.
- `GET /`: lista tickets. Se valida la consulta (`query`) con `ListTicketsQuerySchema`, asegurando que los parámetros de filtrado o paginación sean correctos.

```ts showLineNumbers title="src/interfaces/http/routes/TicketsRouter.ts"
import { Request, Response } from "express";
import { BaseMiddleware } from "../base/BaseMiddleware";
import { BaseRouter } from "../base/BaseRouter";
import { TicketsController } from "../controllers/TicketsController";

export class TicketsRouter extends BaseRouter<TicketsController, BaseMiddleware> {
    constructor ( controller: TicketsController, middleware: BaseMiddleware ) {
        super( controller, middleware );
    }
    protected routes (): void {
        this.router.post( "/",
            this.middleware.validate( "body", CreateTicketSchema ),
            ( req: Request, res: Response ) => this.controller.create( req, res ),
        );

        this.router.get( "/",
            this.middleware.validate( "query", ListTicketsQuerySchema ),
            ( req: Request, res: Response ) => this.controller.list( req, res ),
        );
    }
}
```

## Controlador

Este fragmento define una clase abstracta `BaseController` que actúa como contrato base para controladores HTTP en una arquitectura limpia con Express. Declara tres métodos abstractos (`create`, `list` y `getById`) que deben ser implementados por cualquier controlador concreto que herede de esta clase. Cada método recibe los objetos Request y Response de Express y retorna una promesa, lo que permite manejar operaciones asincrónicas como acceso a base de datos o ejecución de casos de uso.

Este patrón promueve la estandarización de interfaces, facilita la trazabilidad entre rutas y controladores, y permite aplicar principios como el Open/Closed y la separación de responsabilidades.

```ts showLineNumbers title="src/interfaces/http/base/BaseController.ts"
import { Request, Response } from "express";

export abstract class BaseController {
    abstract create ( req: Request, res: Response ): Promise<unknown>;
    abstract list ( req: Request, res: Response ): Promise<unknown>;
    abstract getById ( req: Request, res: Response ): Promise<unknown>;
}
```

Este controlador `TicketsController` extiende de `BaseController` y representa una implementación modular y trazable dentro de una arquitectura limpia. Su propósito es orquestar las operaciones HTTP relacionadas con tickets, delegando la lógica de negocio a casos de uso específicos (`CreateTicket`, `ListTickets`, `GetTicketById`, `ChangeTicketState`) y aplicando validaciones semánticas con Zod.

Actualmente, solo el método `create` está implementado. Este valida el cuerpo de la solicitud con `CreateTicketSchema`, responde con errores estructurados si la validación falla (`z.treeifyError`), y si es exitosa, ejecuta el caso de uso `createTicket` y transforma el resultado con `toHttp` para enviarlo como respuesta HTTP. Los métodos `list`, `getById` y `changeState` están definidos pero aún no implementados, lo que sugiere una estructura progresiva y extensible.

```ts showLineNumbers title="src/interfaces/http/controllers/TicketsController.ts"
import { Request, Response } from "express";
import z from "zod";
import { ChangeStateBodySchema, TicketIdParamSchema } from "../../../application/dtos/id-and-state";
import { ListTicketsQuerySchema } from "../../../application/dtos/list-tickets";
import { CreateTicketSchema } from "../../../application/dtos/ticket";
import { ChangeTicketState } from "../../../application/use-cases/ChangeTicketState";
import { CreateTicket } from "../../../application/use-cases/CreateTicket";
import { GetTicketById } from "../../../application/use-cases/GetTicketById";
import { ListTickets } from "../../../application/use-cases/ListTickets";
import { toHttp } from "../../mappers/TicketMapper";
import { BaseController } from "../base/BaseController";

export class TicketsController extends BaseController {
    constructor (
        private readonly createTicket: CreateTicket,
        private readonly listTickets: ListTickets,
        private readonly getTicketById: GetTicketById,
        private readonly changeTicketState: ChangeTicketState
    ) {
        super();
    }

    async create ( req: Request, res: Response ): Promise<unknown> {
        const parsed = CreateTicketSchema.safeParse( req.body );

        if ( !parsed.success ) {
            return res.status( 400 ).json( {
                errors: z.treeifyError( parsed.error ),
            } );
        }

        const ticket = await this.createTicket.execute( parsed.data );

        res.status( 201 ).json( toHttp( ticket ) );
    }

    list ( req: Request, res: Response ): Promise<unknown> {
        throw new Error( "Method not implemented." );
    }

    getById ( req: Request, res: Response ): Promise<unknown> {
        throw new Error( "Method not implemented." );
    }

    changeState ( req: Request, res: Response ): Promise<unknown> {
        throw new Error( "Method not implemented." );
    };
}
```

## Gestión de controlador y rutas por módulo

Este fragmento define una clase abstracta `BaseModule<Repository>` que sirve como plantilla para módulos de aplicación en una arquitectura limpia. Su propósito es estandarizar la construcción de módulos que dependen de tres componentes clave:

- `repo`: una instancia del repositorio que encapsula el acceso a datos, tipado genéricamente para adaptarse a distintos dominios.
- `bus`: una implementación de `EventBus`, responsable de publicar eventos de dominio y facilitar la comunicación entre módulos.
- `clock`: una abstracción de `Clock`, útil para obtener fechas controladas, especialmente en pruebas o lógica temporal.

```ts showLineNumbers title="src/modules/BaseModule.ts"
import { Clock } from "../application/ports/Clock";
import { EventBus } from "../application/ports/EventBus";

export abstract class BaseModule<Repository> {
    constructor(
        protected readonly repo: Repository,
        protected readonly bus: EventBus,
        protected readonly clock: Clock,
    ) {}
}
```

Este módulo `TicketModule` representa una implementación clara y sostenible del patrón **módulo vertical** dentro de una arquitectura limpia. Su propósito es encapsular toda la lógica relacionada con el recurso "ticket", incluyendo casos de uso, controladores, rutas y middleware, manteniendo una estructura desacoplada y trazable.

Hereda de `BaseModule`, lo que le permite recibir como dependencias el repositorio (`TicketRepository`), el bus de eventos (`EventBus`) y el reloj (`Clock`). En el método `router()`, se instancia el caso de uso `CreateTicket`, se inyecta en el controlador `TicketsController`, y se configura el router HTTP (`TicketsRouter`) con validaciones mediante `BaseMiddleware`. Finalmente, se expone la ruta `/tickets` como punto de entrada para el módulo.

```ts showLineNumbers title="src/modules/TicketModule.ts"
import { Router } from "express";
import { Clock } from "../application/ports/Clock";
import { EventBus } from "../application/ports/EventBus";
import { CreateTicket } from "../application/use-cases/CreateTicket";
import { TicketRepository } from "../application/ports/TicketRepository";
import { TicketsController } from "../interfaces/http/controllers/TicketsController";
import { TicketsRouter } from "../interfaces/http/routes/TicketsRouter";
import { BaseMiddleware } from "../interfaces/http/base/BaseMiddleware";
import { BaseModule } from "./BaseModule";

export class TicketModule extends BaseModule<PrismaTicketRepository> {
    constructor ( repo: TicketRepository, bus: EventBus, clock: Clock ) {
        super( repo, bus, clock );
    }

    public router (): Router {
        const createTicket = new CreateTicket( this.repo, this.clock, this.bus );

        const controller = new TicketsController( createTicket);
        const middleware = new BaseMiddleware();

        const router = Router();
        router.use( "/tickets", new TicketsRouter( controller, middleware ).router );

        return router;
    }
}
```

La clase `ServerBootstrap` se encarga de ensamblar los módulos de la aplicación Express, instanciando sus dependencias y exponiendo sus rutas. En el método `_routers`, se crean el repositorio de tickets (`PrismaTicketRepository`), el bus de eventos (`InMemoryEventBus`) y el reloj (`LocalClock`), que luego se inyectan en el módulo `TicketModule`.

Este módulo encapsula la lógica de negocio, validación y rutas HTTP del recurso "ticket", y expone su router configurado para ser montado en el servidor. Este patrón modular facilita la escalabilidad, la trazabilidad entre capas y la integración progresiva de nuevos recursos.

```ts showLineNumbers title="src/config/ServerBootstrap.ts"
import { LocalClock } from "../application/ports/Clock";;
import { InMemoryEventBus } from "../infrastructure/events/InMemoryEventBus";
import { PrismaTicketRepository } from "../infrastructure/repositories/PrismaTicketRepository";
import { TicketModule } from "../modules/TicketModule";
...

export class ServerBootstrap extends ConfigServer {
    ...
    private _routers = (): Router[] => {
        const ticketsRepository = new PrismaTicketRepository();

        const bus = new InMemoryEventBus( this._logger );
        const clock = new LocalClock();

        return [ new TicketModule( ticketsRepository, bus, clock ).router() ];
    };
    ...
}
```

## Semilla de datos

Este archivo `base.ts` define datos semilla para poblar una base de datos Prisma en un sistema de gestión de tickets hospitalarios. Incluye tres entidades clave:

- **USERS**: tres perfiles institucionales con roles diferenciados (admin, soporte, enfermería).
- **AREAS**: zonas hospitalarias como Urgencias, Laboratorio Clínico e Imagenología.
- **TICKETS**: cinco solicitudes con distintos estados (`OPEN`, `ASSIGNED`, etc.) y prioridades (`LOW` a `URGENT`), asociadas a usuarios y áreas específicas.

Además, se tipifican los valores de estado y prioridad mediante `as const` y `typeof`, lo que permite validación estricta y autocompletado en TypeScript.

```ts showLineNumbers title="prisma/seed-data/base.ts"
export const USERS = [
  { id: "5a8d0f70-6b3b-4f6f-9b93-3b2b2e2f0001", name: "Alice Admin",  email: "alice.admin@hospital.edu" },
  { id: "5a8d0f70-6b3b-4f6f-9b93-3b2b2e2f0002", name: "Bob Support",  email: "bob.support@hospital.edu" },
  { id: "5a8d0f70-6b3b-4f6f-9b93-3b2b2e2f0003", name: "Carol Nurse",  email: "carol.nurse@hospital.edu" }
] as const;

export const AREAS = [
  { id: "6b1a9c80-1234-4567-8901-abcdefabcdef", name: "Urgencias" },
  { id: "6b1a9c80-1234-4567-8901-abcdefabcdee", name: "Laboratorio Clínico" },
  { id: "6b1a9c80-1234-4567-8901-abcdefabcded", name: "Imagenología" }
] as const;

export const TICKET_STATUS = ["OPEN","ASSIGNED","IN_PROGRESS","RESOLVED","CLOSED","CANCELLED"] as const;
export const TICKET_PRIORITY = ["LOW","MEDIUM","HIGH","URGENT"] as const;

export type Status = (typeof TICKET_STATUS)[number];
export type Priority = (typeof TICKET_PRIORITY)[number];

export const TICKETS: Array<{
  title: string;
  status: Status;
  priority: Priority;
  userId: string;
  areaId: string;
  createdAt?: Date;
}> = [
  {
    title: "PC de triage no enciende",
    status: "OPEN",
    priority: "HIGH",
    userId: USERS[1].id,
    areaId: AREAS[0].id,
  },
  {
    title: "Impresora de etiquetas sin papel",
    status: "ASSIGNED",
    priority: "MEDIUM",
    userId: USERS[2].id,
    areaId: AREAS[1].id,
  },
  {
    title: "Conexión caída en sala de rayos X",
    status: "IN_PROGRESS",
    priority: "URGENT",
    userId: USERS[0].id,
    areaId: AREAS[2].id,
  },
  {
    title: "Actualización software LIS",
    status: "RESOLVED",
    priority: "LOW",
    userId: USERS[1].id,
    areaId: AREAS[1].id,
  },
  {
    title: "Mouse dañado en estación de enfermería",
    status: "CLOSED",
    priority: "LOW",
    userId: USERS[2].id,
    areaId: AREAS[0].id,
  }
];
```

Este script `seed.ts` inicializa la base de datos Prisma con datos semilla para usuarios, áreas y tickets. Primero limpia las tablas (`clearAll`), luego inserta o actualiza usuarios y áreas mediante `upsert`, y finalmente crea tickets conectando relaciones con `user` y `area`.

El flujo está encapsulado en `main()`, que gestiona errores y desconexión segura del cliente Prisma. Este patrón garantiza consistencia, idempotencia y trazabilidad, ideal para entornos de desarrollo, pruebas o despliegue inicial.

```ts showLineNumbers title="prisma/seed.ts"
import "dotenv/config";
import { PrismaClient } from "./generated/prisma";
import { USERS, AREAS, TICKETS } from "./seed-data/base";

const prisma = new PrismaClient();

async function seedUsers() {
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { name: u.name, email: u.email },
      create: { id: u.id, name: u.name, email: u.email },
    });
  }
}

async function seedAreas() {
  for (const a of AREAS) {
    await prisma.area.upsert({
      where: { id: a.id },
      update: { name: a.name },
      create: { id: a.id, name: a.name },
    });
  }
}

async function seedTickets() {
  for (const t of TICKETS) {
    await prisma.ticket.create({
      data: {
        title: t.title,
        status: t.status,
        priority: t.priority,
        user: { connect: { id: t.userId } },
        area: { connect: { id: t.areaId } },
        createdAt: t.createdAt ?? new Date(),
      },
    });
  }
}

async function clearAll() {
  await prisma.ticket.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.area.deleteMany({});
}

async function main() {
  console.log(">>> Seeding database...");
  await clearAll();

  await seedUsers();
  await seedAreas();
  await seedTickets();

  console.log(">>> Seed completed.");
}

main()
  .catch((e) => {
    console.error(">>> Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Vamos a crear un nuevo archivo para configurar el seed de prisma:

```ts showLineNumbers title="prisma.config.ts"
import { PrismaConfig } from 'prisma/config';

const config: PrismaConfig = {
    migrations: {
        seed: "tsx prisma/seed.ts",
    },
};

export default config;
```

## Casos de uso y rutas mínimas adicionales

Este DTO `pagination.ts` define un esquema de paginación robusto usando Zod. El `PaginationSchema` valida dos parámetros:

- `offset`: número entero mínimo 0, con coerción automática y valor por defecto 0.
- `limit`: número entero entre 1 y 100, también con coerción y valor por defecto 20.

La inferencia de tipo (`PaginationInput`) permite reutilizar esta validación tanto en controladores como en casos de uso, garantizando consistencia semántica y trazabilidad.

```ts showLineNumbers title="src/application/dtos/pagination.ts"
import { z } from "zod";

export const PaginationSchema = z.object( {
    offset: z.coerce.number().int().min( 0 ).default( 0 ),
    limit: z.coerce.number().int().min( 1 ).max( 100 ).default( 20 ),
} );
export type PaginationInput = z.infer<typeof PaginationSchema>;
```

Este DTO `ListTicketsQuerySchema` define la estructura validada para consultas de tickets en una API, combinando paginación, filtros y ordenamiento. Extiende `PaginationSchema` e incorpora campos opcionales como `status`, `priority`, `areaId`, `userId`, y rangos de fecha (`createdFrom`, `createdTo`), todos tipados con Zod para garantizar consistencia semántica.

Además, permite ordenar los resultados por `createdAt`, `priority` o `title`, en orden ascendente o descendente, con valores por defecto.

```ts showLineNumbers title="src/application/dtos/list-tickets.ts"
import { z } from "zod";
import { ZTicketPriority, ZTicketStatus } from "../../domain/value-objects/status.zod";
import { PaginationSchema } from "./pagination";

export const SortByValues = [ "createdAt", "priority", "title" ] as const;
export const OrderValues = [ "asc", "desc" ] as const;

export const ListTicketsQuerySchema = PaginationSchema.extend( {
    status: ZTicketStatus.optional(),
    priority: ZTicketPriority.optional(),
    areaId: z.uuidv4().optional(),
    userId: z.uuidv4().optional(),
    createdFrom: z.coerce.date().optional(),
    createdTo: z.coerce.date().optional(),
    sortBy: z.enum( SortByValues ).default( "createdAt" ),
    order: z.enum( OrderValues ).default( "desc" ),
} );
export type ListTicketsQuery = z.infer<typeof ListTicketsQuerySchema>;
```

Este archivo `id-and-state.ts` define dos esquemas Zod fundamentales para operaciones sobre tickets:

- `TicketIdParamSchema`: valida que el parámetro `id` sea un UUID v4, útil para rutas como `GET /tickets/:id` o `PATCH /tickets/:id/state`. Garantiza que el identificador del ticket tenga un formato válido antes de procesar la solicitud.

- `ChangeStateBodySchema`: valida el cuerpo de una petición que cambia el estado de un ticket, asegurando que el campo `to` sea un valor permitido por `ZTicketStatus` (por ejemplo: `"OPEN"`, `"RESOLVED"`, etc.).

Ambos esquemas refuerzan la integridad de los datos entrantes y permiten inferir tipos TypeScript (`TicketIdParam`, `ChangeStateBody`), promoviendo consistencia entre validación y tipado.

```ts showLineNumbers title="id-and-state.ts"
import { z } from "zod";
import { ZTicketStatus } from "../../domain/value-objects/status.zod";

export const TicketIdParamSchema = z.object( {
    id: z.uuidv4(),
} );
export type TicketIdParam = z.infer<typeof TicketIdParamSchema>;

export const ChangeStateBodySchema = z.object( {
    to: ZTicketStatus,
} );
export type ChangeStateBody = z.infer<typeof ChangeStateBodySchema>;
```

Esta ampliación del puerto `TicketRepository` introduce el método `search`, que permite realizar búsquedas paginadas y filtradas de tickets según múltiples criterios: estado, prioridad, usuario, área, rango de fechas, campo de ordenamiento y dirección (`asc` o `desc`). El método retorna una promesa con los resultados (`items`), el total de coincidencias y los parámetros de paginación (`offset`, `limit`).

Este diseño promueve la trazabilidad entre capa de aplicación y dominio, y permite desacoplar la lógica de consulta del motor de persistencia.

```ts showLineNumbers title="src/application/ports/TicketRepository.ts"
import { Ticket } from "../../domain/entities/Ticket";

export interface TicketRepository {
    ...
    search ( params: {
        offset: number;
        limit: number;
        status?: Ticket[ "status" ];
        priority?: Ticket[ "priority" ];
        userId?: string;
        areaId?: string;
        createdFrom?: Date;
        createdTo?: Date;
        sortBy?: "createdAt" | "priority" | "title";
        order?: "asc" | "desc";
    } ): Promise<{ items: Ticket[]; total: number; offset: number; limit: number; }>;
}
```

Este caso de uso `ListTickets` encapsula la lógica de consulta de tickets con filtros, ordenamiento y paginación. Recibe un `ListTicketsQuery` validado previamente y delega la búsqueda al repositorio mediante el método `search`, retornando los resultados junto con metadatos (`total`, `offset`, `limit`).

Este patrón promueve la separación de responsabilidades, la trazabilidad entre DTOs y puertos, y la testabilidad del flujo de consulta.

```ts showLineNumbers title="src/application/use-cases/ListTickets.ts"
import type { ListTicketsQuery } from "../dtos/list-tickets";
import type { TicketRepository } from "../ports/TicketRepository";

export class ListTickets {
    constructor ( private readonly repo: TicketRepository ) { }

    async execute ( query: ListTicketsQuery ) {
        const { items, total, offset, limit } = await this.repo.search( query );
        return { items, total, offset, limit };
    }
}
```

Este caso de uso `GetTicketById` encapsula la lógica para recuperar un ticket por su identificador. Recibe el `id` como parámetro, delega la búsqueda al repositorio mediante `findById`, y si no encuentra el ticket, lanza un error enriquecido con un `statusCode` 404 para facilitar el manejo HTTP en capas superiores.

Este patrón promueve la trazabilidad entre dominio y presentación, y permite una gestión clara de errores.

```ts showLineNumbers title="src/application/use-cases/GetTicketById.ts"
import type { TicketRepository } from "../ports/TicketRepository";

export class GetTicketById {
    constructor ( private readonly repo: TicketRepository ) { }

    async execute ( id: string ) {
        const ticket = await this.repo.findById( id );
        if ( !ticket ) throw Object.assign(
            new Error( "Ticket not found" ),
            { statusCode: 404 }
        );
        return ticket;
    }
}
```

Este caso de uso `ChangeTicketState` encapsula la lógica para cambiar el estado de un ticket de forma controlada y trazable. Primero recupera el ticket por su ID; si no existe, lanza un error 404. Luego valida la transición de estado mediante `canTransition`, asegurando que el cambio sea permitido por la máquina de estados. Si la transición es válida, actualiza el estado, guarda el ticket y publica un evento `ticket.state_changed` con metadatos como hora (`clock.now()`), estado anterior, nuevo estado y actor responsable.

Este patrón promueve la integridad del dominio, la trazabilidad de cambios y la desacoplación entre lógica de negocio y eventos.

```ts showLineNumbers title="src/application/use-cases/ChangeTicketState.ts"
import { canTransition } from "../../domain/services/TicketStateMachine";
import type { TicketStatus } from "../../domain/value-objects/Status";
import type { Clock } from "../ports/Clock";
import type { EventBus } from "../ports/EventBus";
import type { TicketRepository } from "../ports/TicketRepository";

export class ChangeTicketState {
    constructor (
        private readonly repo: TicketRepository,
        private readonly clock: Clock,
        private readonly bus: EventBus,
    ) { }

    async execute ( input: { ticketId: string; to: TicketStatus; actorId?: string; } ) {
        const ticket = await this.repo.findById( input.ticketId );
        if ( !ticket ) throw Object.assign(
            new Error( "Ticket not found" ),
            { statusCode: 404 }
        );

        if ( !canTransition( ticket.status, input.to ) ) {
            throw Object.assign(
                new Error( `Invalid transition from ${ ticket.status } to ${ input.to }` ),
                { statusCode: 422 },
            );
        }

        const prev = ticket.status;
        ticket.status = input.to;
        await this.repo.save( ticket );

        await this.bus.publishAll( [
            {
                type: "ticket.state_changed",
                occurredAt: this.clock.now(),
                payload: {
                    id: ticket.id.toString(),
                    to: input.to,
                    from: prev,
                    actorId: input.actorId ?? null,
                },
            },
        ] );

        return ticket;
    }
}
```

Esta implementación del método `search` en `PrismaTicketRepository` traduce los parámetros de búsqueda en una consulta Prisma eficiente y paginada. Construye dinámicamente el objeto `where` según los filtros recibidos (estado, prioridad, usuario, área, fechas), y define el ordenamiento con `orderBy` usando `sortBy` y `order`. Luego ejecuta en paralelo dos operaciones: contar el total de coincidencias y recuperar los tickets paginados.

Finalmente, transforma los resultados con `Ticket.rehydrate`, asegurando que cada registro se convierta en una entidad de dominio.

```ts showLineNumbers title="src/infrastructure/repositories/PrismaTicketRepository.ts"
import { RehydrateTicketDto } from "../../application/dtos/ticket";
import { TicketRepository } from "../../application/ports/TicketRepository";
import { Ticket } from "../../domain/entities/Ticket";
import { prismaClient } from "../db/prisma";

export class PrismaTicketRepository implements TicketRepository {
    ...
    async search ( params: { offset: number; limit: number; status?: Ticket[ "status" ]; priority?: Ticket[ "priority" ]; userId?: string; areaId?: string; createdFrom?: Date; createdTo?: Date; sortBy?: "createdAt" | "priority" | "title"; order?: "asc" | "desc"; } ): Promise<{ items: Ticket[]; total: number; offset: number; limit: number; }> {
        const where: any = {};

        if ( params.status ) where.status = params.status;
        if ( params.priority ) where.priority = params.priority;
        if ( params.userId ) where.userId = params.userId;
        if ( params.areaId ) where.areaId = params.areaId;
        if ( params.createdFrom || params.createdTo ) {
            where.createdAt = {};
            if ( params.createdFrom ) where.createdAt.gte = params.createdFrom;
            if ( params.createdTo ) where.createdAt.lte = params.createdTo;
        }

        const orderBy = [
            { [ params.sortBy ?? "createdAt" ]: params.order ?? "desc" }
        ] as any;

        const [ total, rows ] = await Promise.all( [
            prismaClient.ticket.count( { where } ),
            prismaClient.ticket.findMany( {
                where,
                orderBy,
                skip: params.offset,
                take: params.limit,
            } ),
        ] );

        return {
            total,
            offset: params.offset,
            limit: params.limit,
            items: rows.map( ( r ) => Ticket.rehydrate( r as any ) ),
        };
    }
}
```

Este controlador `TicketsController` expone operaciones HTTP para listar, consultar y cambiar el estado de tickets, integrando validaciones con Zod y casos de uso desacoplados. Cada método valida la entrada (`query`, `params`, `body`) con sus respectivos esquemas (`ListTicketsQuerySchema`, `TicketIdParamSchema`, `ChangeStateBodySchema`) y responde con errores estructurados si la validación falla.

Una vez validado, delega la lógica a los casos de uso (`ListTickets`, `GetTicketById`, `ChangeTicketState`) y transforma las entidades de dominio a formato HTTP mediante `toHttp`.

```ts showLineNumbers title="src/interfaces/http/controllers/TicketsController.ts"
import { Request, Response } from "express";
import z from "zod";
import { ChangeStateBodySchema, TicketIdParamSchema } from "../../../application/dtos/id-and-state";
import { ListTicketsQuerySchema } from "../../../application/dtos/list-tickets";
import { CreateTicketSchema } from "../../../application/dtos/ticket";
import { ChangeTicketState } from "../../../application/use-cases/ChangeTicketState";
import { GetTicketById } from "../../../application/use-cases/GetTicketById";
import { ListTickets } from "../../../application/use-cases/ListTickets";
import { toHttp } from "../../mappers/TicketMapper";
...

export class TicketsController extends BaseController {
    constructor (
        ...
        private readonly listTickets: ListTickets,
        private readonly getTicketById: GetTicketById,
        private readonly changeTicketState: ChangeTicketState
    ) {
        super();
    }

    ...
    async list ( req: Request, res: Response ): Promise<unknown> {
        const parsed = ListTicketsQuerySchema.safeParse( req.query );

        if ( !parsed.success ) return res.status( 400 ).json( {
            errors: z.treeifyError( parsed.error )
        } );

        const result = await this.listTickets.execute( parsed.data );
        res.json( {
            total: result.total,
            offset: result.offset,
            limit: result.limit,
            items: result.items.map( toHttp ),
        } );
    }

    async getById ( req: Request, res: Response ): Promise<unknown> {
        const parsed = TicketIdParamSchema.safeParse( req.params );

        if ( !parsed.success ) return res.status( 400 ).json( {
            errors: z.treeifyError( parsed.error )
        } );

        const ticket = await this.getTicketById.execute( parsed.data.id );

        res.json( toHttp( ticket ) );
    }

    async changeState ( req: Request, res: Response ): Promise<unknown> {
        const idOk = TicketIdParamSchema.safeParse( req.params );

        if ( !idOk.success ) return res.status( 400 ).json( {
            errors: z.treeifyError( idOk.error )
        } );

        const bodyOk = ChangeStateBodySchema.safeParse( req.body );

        if ( !bodyOk.success ) return res.status( 400 ).json( {
            errors: z.treeifyError( bodyOk.error )
        } );

        const ticket = await this.changeTicketState.execute( {
            ticketId: idOk.data.id,
            to: bodyOk.data.to,
            actorId: ( req as any ).user?.id,
        } );

        res.json( toHttp( ticket ) );
    };
}
```

Este módulo `TicketModule` organiza de forma vertical y desacoplada la gestión del recurso "ticket", integrando casos de uso, controlador y middleware en una única unidad trazable. En el método `router()`, se instancian los casos de uso (`CreateTicket`, `ListTickets`, `GetTicketById`, `ChangeTicketState`) y se inyectan en el `TicketsController`, que encapsula la lógica HTTP. El `BaseMiddleware` se aplica a todas las rutas del recurso mediante `TicketsRouter`.

Este patrón modular permite escalar el sistema de forma sostenible, manteniendo la separación de responsabilidades y facilitando la extensión con nuevos endpoints o validaciones.

```ts showLineNumbers title="src/modules/TicketModule.ts"
import { Router } from "express";
import { Clock } from "../application/ports/Clock";
import { EventBus } from "../application/ports/EventBus";
import { TicketRepository } from "../application/ports/TicketRepository";
import { ChangeTicketState } from "../application/use-cases/ChangeTicketState";
import { CreateTicket } from "../application/use-cases/CreateTicket";
import { GetTicketById } from "../application/use-cases/GetTicketById";
import { ListTickets } from '../application/use-cases/ListTickets';
import { BaseMiddleware } from "../interfaces/http/base/BaseMiddleware";
import { TicketsController } from "../interfaces/http/controllers/TicketsController";
import { TicketsRouter } from "../interfaces/http/routes/TicketsRouter";
import { BaseModule } from "./BaseModule";

export class TicketModule extends BaseModule<TicketRepository> {
    constructor ( repo: TicketRepository, bus: EventBus, clock: Clock ) {
        super( repo, bus, clock );
    }

    public router (): Router {
        const createTicket = new CreateTicket( this.repo, this.clock, this.bus );
        const listTickets = new ListTickets( this.repo );
        const getTicketById = new GetTicketById( this.repo );
        const changeTicketState = new ChangeTicketState( this.repo, this.clock, this.bus );

        const controller = new TicketsController( createTicket, listTickets, getTicketById, changeTicketState );
        const middleware = new BaseMiddleware();

        const router = Router();
        router.use( "/tickets", new TicketsRouter( controller, middleware ).router );

        return router;
    }
}
```

Este archivo `TicketsRouter.ts` define las rutas HTTP del recurso `ticket`, integrando validaciones semánticas con Zod y delegando la lógica al controlador. Extiende `BaseRouter` y aplica `BaseMiddleware` para validar `body`, `query` y `params` según el esquema correspondiente antes de ejecutar cada acción.

Las rutas expuestas son:

- `POST /tickets`: creación de tickets con validación de cuerpo (`CreateTicketSchema`).
- `GET /tickets`: listado con filtros y paginación (`ListTicketsQuerySchema`).
- `GET /tickets/:id`: consulta puntual por ID (`TicketIdParamSchema`).
- `PATCH /tickets/:id/state`: cambio de estado con validación doble (`TicketIdParamSchema` + `ChangeStateBodySchema`).

```ts showLineNumbers title="src/interfaces/http/routes/TicketsRouter.ts"
import { Request, Response } from "express";
import { ChangeStateBodySchema, TicketIdParamSchema } from "../../../application/dtos/id-and-state";
import { ListTicketsQuerySchema } from "../../../application/dtos/list-tickets";
import { CreateTicketSchema } from "../../../application/dtos/ticket";
import { BaseMiddleware } from "../base/BaseMiddleware";
import { BaseRouter } from "../base/BaseRouter";
import { TicketsController } from "../controllers/TicketsController";


export class TicketsRouter extends BaseRouter<TicketsController, BaseMiddleware> {
    constructor ( controller: TicketsController, middleware: BaseMiddleware ) {
        super( controller, middleware );
    }
    protected routes (): void {
        this.router.post( "/",
            this.middleware.validate( "body", CreateTicketSchema ),
            ( req: Request, res: Response ) => this.controller.create( req, res ),
        );

        this.router.get( "/",
            this.middleware.validate( "query", ListTicketsQuerySchema ),
            ( req: Request, res: Response ) => this.controller.list( req, res ),
        );

        this.router.get( "/:id",
            this.middleware.validate( "params", TicketIdParamSchema ),
            ( req: Request, res: Response ) => this.controller.getById( req, res ),
        );

        this.router.patch( "/:id/state",
            this.middleware.validate( "params", TicketIdParamSchema ),
            this.middleware.validate( "body", ChangeStateBodySchema ),
            ( req: Request, res: Response ) => this.controller.changeState( req, res ),
        );
    }
}
```

## Autenticación y autorización

Para gestionar la autenticación de un usuario vamos a añadir las columnas `passwordHash` y `role` de tipo `Role`:

```prisma showLineNumbers title="prisma/schema.prisma"
enum Role {
  ADMIN
  USER
}

model User {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)
  tickets      Ticket[] @relation("UserTickets")
}
```

Generamos la migración a la base de datos con el nuevo esquema:

```bash
npm run prisma:migrate -- --name "auth_rbac"
```

Regeneramos el cliente prisma para que refleje los cambios de la base de datos

```bash
npm run prisma:generate
```

En caso de que se genere un error por los datos guardado luego del seed, entonces se debe ejecutar:

```bash
npm run prisma:reset
```

Este DTO `auth.ts` define los esquemas de validación para registro y autenticación de usuarios usando Zod:

- **`RegisterSchema`** valida nombre (mínimo 2 caracteres), correo electrónico, contraseña (mínimo 8 caracteres) y rol opcional (`ADMIN` o `USER`), con valor por defecto `"USER"`.
- **`LoginSchema`** valida correo y contraseña con los mismos criterios.

Ambos esquemas permiten inferir tipos (`RegisterInput`, `LoginInput`) para mantener consistencia entre validación y tipado.

```ts showLineNumbers title="src/application/dtos/auth.ts"
import { z } from "zod";

export const RoleValues = [ "ADMIN", "USER" ] as const;
export const ZRole = z.enum( RoleValues );

export const RegisterSchema = z.object( {
    name: z.string().trim().min( 2 ),
    email: z.email(),
    password: z.string().min( 8 ),
    role: ZRole.optional().default( "USER" ),
} );
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object( {
    email: z.email(),
    password: z.string().min( 8 ),
} );
export type LoginInput = z.infer<typeof LoginSchema>;
```

Añadir función de parse para el value object del email:

```ts showLineNumbers title="src/domain/value-objects/Email.ts"
export class Email {
    ...
    static parse ( value: string ): Email {
        return new Email( value );
    }
}
```

Modificación de la entidad "User" para autenticación y rehidratación de registro desde la base de datos.

```ts showLineNumbers title="src/domain/entities/User.ts"
import { RehydrateUserDto } from "../../application/dtos/user";
import { Email } from "../value-objects/Email";
import { BaseEntity } from "./BaseEntity";

type Role = "ADMIN" | "USER";

export class User extends BaseEntity {
    constructor (
        id: string,
        public name: string,
        public readonly email: Email,
        public readonly passwordHash: string,
        public role: Role,
        public createdAt: Date = new Date()
    ) {
        super( id );
    }

    public static rehydrate ( row: RehydrateUserDto ): User {
        return new User(
            row.id,
            row.name,
            Email.parse( row.email ),
            row.passwordHash,
            row.role,
            new Date( row.createdAt ),
        );
    }
}
```

Definición de puerto para la entidad de Usuarios.

```ts showLineNumbers title="src/application/ports/UserRepository.ts"
import { User } from "../../domain/entities/User";

export interface UserRepository {
    create ( user: User ): Promise<User>;
    findById ( id: string ): Promise<User | null>;
    findByEmail ( email: string ): Promise<User | null>;
}
```

Implementación del repositorio aplicado a Prisma.

```ts showLineNumbers title="src/infrastructure/repositories/PrismaUserRepository.ts"
import { RehydrateUserDto } from "../../application/dtos/user";
import { UserRepository } from "../../application/ports/UserRepository";
import { User } from "../../domain/entities/User";
import { prismaClient } from "../db/prisma";

export class PrismaUserRepository implements UserRepository {
    async create ( user: User ): Promise<User> {
        const row = await prismaClient.user.create( {
            data: {
                id: user.id.toString(),
                name: user.name,
                email: user.email.toString(),
                passwordHash: user.passwordHash,
                role: user.role
            }
        } );

        return User.rehydrate( row as RehydrateUserDto );
    }

    async findById ( id: string ): Promise<User | null> {
        const row = await prismaClient.user.findUnique( {
            where: { id }
        } );

        return row ? User.rehydrate( row as RehydrateUserDto ) : null;
    }

    async findByEmail ( email: string ): Promise<User | null> {
        const row = await prismaClient.user.findUnique( {
            where: { email }
        } );

        return row ? User.rehydrate( row as RehydrateUserDto ) : null;
    }
}
```

Esta clase `Password` encapsula la lógica de hashing y verificación de contraseñas utilizando la biblioteca `bcryptjs`, promoviendo seguridad y reutilización:

- `hash(plain, rounds)`: genera un hash seguro a partir de una contraseña en texto plano, con un número configurable de rondas de sal (por defecto 12, ajustándose a un estándar de producción, con tiempo de ejecución de aproximadamente 300 ms y 4096 iteraciones, teniendo un nivel de seguridad fuerte), lo que incrementa la resistencia a ataques de fuerza bruta.
- `compare(plain, hash)`: compara una contraseña ingresada con su hash almacenado, devolviendo un booleano que indica si coinciden.

Este diseño desacopla la lógica criptográfica del resto del sistema, facilitando pruebas, mantenimiento y posibles migraciones a otros algoritmos.

```ts showLineNumbers title="src/infrastructure/security/Password.ts"
import bcrypt from "bcryptjs";

export class Password {
    static async hash ( plain: string, rounds = 10 ) {
        return bcrypt.hash( plain, rounds );
    }

    static async compare ( plain: string, hash: string ) {
        return bcrypt.compare( plain, hash );
    }
}
```

Para la autorización estaremos usando PASETO, para el cual requerimos la instalación con:

```bash
npm i paseto
```

Este archivo `.env` define variables de entorno para la configuración de autenticación basada en PASETO (Platform-Agnostic Security Tokens), una alternativa moderna y segura a JWT. Aquí se especifican:

- `PASETO_PUBLIC_KEY` y `PASETO_PRIVATE_KEY`: claves para firmar y verificar tokens. Aunque están vacías, se espera que contengan claves en formato adecuado (Ed25519).
- `TOKEN_ISSUER`: identifica el emisor del token, útil para validaciones de confianza.
- `TOKEN_AUDIENCE`: define el público objetivo del token, como clientes o servicios que deben aceptarlo.
- `TOKEN_EXPIRES_IN`: duración del token, en este caso 2 horas.

Este patrón permite configurar la seguridad de forma desacoplada y trazable, ideal para documentar como plantilla institucional para autenticación robusta y controlada. ¿Te gustaría que lo complemente con una guía de generación de claves y validación de tokens para semilleros?

```env showLineNumbers
PASETO_PUBLIC_KEY=
PASETO_PRIVATE_KEY=
TOKEN_ISSUER=hospital.desk.api
TOKEN_AUDIENCE=hospital.desk.clients
TOKEN_EXPIRES_IN=2h
```

Para generar las llaves públicas y privadas se ejecuta el siguiente comando:

```bash
ssh-keygen -t ed25519 -C "hospital.desk.api"
```

Al ejecutar el comando, debemos indicar el lugar donde queremos guardar las llaves, por ejemplo, en nuestro proyecto se guardarán en la carpeta `secrets` con el nombre de `dev`.

También se puede añadir una frase que sirva de capa adicional de seguridad, en el input "Enter passphrase", por ejemplo voy a añadir: `MiClaveSuperSegura#2025!HospitalDesk`.

El patron ASCII generado con el nombre de randomart image, también lo podemos guardar dentro de los secrets, pero este es opcional y no afecta el funcionamiento de la aplicación.

El ideal es que siempre se genere una llave pública o privada por entorno.

Regresando a las llaves públicas y privadas generadas, vamos a convertir sus valore en **base64** y copiar el resultado dentro del archivo `.env`.

En el mapeo de las variables de entorno con zod, debemos hacer una modificación:

```ts showLineNumbers title="src/config/env.config.ts"
const envSchema = z.object( {
    PASETO_PUBLIC_KEY: z.string().min( 10 ),
    PASETO_PRIVATE_KEY: z.string().min( 10 ),
    TOKEN_ISSUER: z.string().default( "hospital.desk.api" ),
    TOKEN_AUDIENCE: z.string().default( "hospital.desk.clients" ),
    TOKEN_EXPIRES_IN: z.union( [ z.string(), z.number() ] ).default( '2h' ),
    ...
} );
```

Siempre es importante recordar que las llaves se descarten de ser expuestas en un repositorio o otros, usando por ejemplo `.gitignore`.

```ts showLineNumbers title="src/infrastructure/security/PasetoService.ts"

```

## Paginación, filtros y orden

## Manejo de errores y respuesta uniforme

## Observabilidad y salud

## Documentación de API

## Pruebas

## CI (Github Actions) mínimamente útil

## Contenerización del servicios (app)

## Endurecimiento y seguridad

## Auditoria y bitácora de dominio

## Semillas y dataset de muestra

## Módulos siguientes

## Checklist de "listo para producción"
