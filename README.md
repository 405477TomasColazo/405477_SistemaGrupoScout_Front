# Sistema Grupo Scout José Hernández - Frontend

[![Angular](https://img.shields.io/badge/Angular-19-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Descripción

Aplicación web frontend desarrollada con Angular 19 para la gestión integral del Grupo Scout José Hernández. Proporciona interfaces diferenciadas para familias, educadores y administradores, permitiendo la gestión de scouts, eventos, pagos y seguimiento de progresión personal.

## 🚀 Características Principales

- **Dashboard Multi-Rol**: Interfaces específicas para familias, educadores y administradores
- **Gestión de Miembros**: Administración completa de scouts y grupos familiares  
- **Sistema de Eventos**: Visualización y gestión de actividades scouts
- **Procesamiento de Pagos**: Integración con MercadoPago para pagos en línea
- **Progresión Personal**: Sistema digital de hojas de marcha y seguimiento de competencias
- **Autenticación Segura**: Login JWT con control de acceso basado en roles
- **Responsive Design**: Adaptado para dispositivos móviles y desktop
- **Dashboards Interactivos**: Visualización de datos con Chart.js

## 🛠️ Stack Tecnológico

- **Framework**: Angular 19
- **Lenguaje**: TypeScript 5.0+
- **Styling**: TailwindCSS 4.x
- **Gráficos**: Chart.js
- **HTTP Client**: Angular HttpClient con interceptores JWT
- **Pagos**: MercadoPago SDK JS 0.0.3
- **Testing**: Jasmine + Karma
- **Build**: Angular CLI + Webpack
- **State Management**: RxJS BehaviorSubjects

## 📦 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm 9+
- Angular CLI 19+

### Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd 405477_SistemaGrupoScout_Front/Sistema-Scouts-Jose-Hernandez
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (opcional):
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080',
  mercadoPagoPublicKey: 'tu-public-key-aqui'
};
```

4. Ejecutar la aplicación:
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## 🎯 Comandos de Desarrollo

```bash
# Servidor de desarrollo
npm start                     # Puerto 4200
ng serve                      # Alternativo

# Build para producción
npm run build                 # Optimizado para producción
ng build --prod              # Con optimizaciones adicionales

# Build con observación de cambios
npm run watch

# Tests unitarios
npm test                      # Con Karma
ng test

# Tests e2e
ng e2e

# Generación de componentes
ng generate component nombre-componente
ng generate service nombre-servicio
ng generate module nombre-modulo
```

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/app/
├── core/                   # Módulo principal
│   ├── auth/              # Servicios de autenticación
│   ├── models/            # Modelos de datos TypeScript
│   └── services/          # Servicios de negocio
├── shared/                # Componentes compartidos
│   ├── admin-dashboard/   # Dashboard administrativo
│   ├── educator-dashboard/# Dashboard educadores
│   ├── family-gestion/    # Gestión familiar
│   ├── family-events/     # Eventos familiares
│   ├── event-management/  # Gestión de eventos
│   ├── payments/          # Sistema de pagos
│   ├── progression/       # Progresión personal
│   └── registry/          # Registro de usuarios
└── features/              # Funcionalidades específicas
```

### Arquitectura de Componentes

#### Core Module
- **AuthService**: Gestión de autenticación JWT
- **TokenService**: Manejo de tokens de acceso
- **UserService**: Operaciones de usuario
- **Models**: Interfaces TypeScript para tipado fuerte

#### Shared Components
- **Multi-Dashboard**: Componentes específicos por rol de usuario
- **Event Management**: CRUD completo de eventos
- **Payment System**: Integración con MercadoPago
- **Progression Tracking**: Sistema de hojas de marcha digitales

### Sistema de Autenticación

```typescript
// Flujo de autenticación
Login → JWT Token → Interceptor → API Calls → Role-based Access
```

- **JWT Interceptor**: Inyección automática de tokens
- **Auth Guard**: Protección de rutas (pendiente implementación)
- **Role Management**: Control de acceso basado en roles
- **Token Refresh**: Manejo automático de expiración

## 🎨 Sistema de Styling

### TailwindCSS 4.x

```css
/* Configuración personalizada */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Clases personalizadas para el tema scout */
.scout-primary { @apply bg-blue-600 text-white; }
.scout-secondary { @apply bg-green-500 text-white; }
.card-scout { @apply bg-white shadow-lg rounded-lg p-6; }
```

### Responsive Design

- **Mobile First**: Diseño adaptativo desde móvil
- **Breakpoints**: Configurados para tablet y desktop
- **Components**: Todos responsive por defecto

## 📱 Roles y Funcionalidades

### 👨‍👩‍👧‍👦 Familias
- Dashboard con resumen de scouts familiares
- Visualización de eventos disponibles
- Gestión de registraciones a eventos
- Histórico de pagos y cuotas
- Seguimiento de progresión personal de scouts

### 👨‍🏫 Educadores  
- Dashboard con scouts de sus secciones
- Gestión de asistencia a eventos
- Aprobación de competencias de progresión
- Creación y seguimiento de hojas de marcha
- Comunicación con familias

### 👑 Administradores
- Dashboard ejecutivo con métricas
- Gestión completa de usuarios y roles
- Administración de eventos y actividades
- Control de pagos y finanzas
- Configuración del sistema de progresión

## 🔐 Seguridad

### Autenticación JWT

```typescript
// Interceptor automático
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.tokenService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

### Control de Acceso

- **Route Guards**: Protección de rutas por rol (implementación pendiente)
- **Component Guards**: Control de visibilidad de elementos
- **API Security**: Todas las llamadas autenticadas
- **Token Management**: Renovación automática y logout seguro

## 🌐 Integración con Backend

### API Communication

```typescript
// Configuración base
private apiUrl = 'http://localhost:8080';

// Principales endpoints
/auth/login          - Autenticación
/api/members         - Gestión de miembros  
/api/events          - Eventos y actividades
/api/payments        - Procesamiento de pagos
/api/progression     - Sistema de progresión
```

### Manejo de Estados

```typescript
// Patrón de servicio con BehaviorSubject
@Injectable()
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  
  setUser(user: User) {
    this.userSubject.next(user);
  }
}
```

## 📊 Sistema de Progresión Personal

### Hojas de Marcha Digitales

- **Competencias**: Sistema de habilidades por áreas de crecimiento
- **Seguimiento**: Progreso individual de cada scout
- **Aprobación**: Flujo educador → familia → scout
- **Reportes**: Dashboards de progreso y estadísticas

### Áreas de Crecimiento

1. **Desarrollo de la Paz** - Competencias sociales y valores
2. **Salud y Bienestar** - Autocuidado y vida saludable  
3. **Medio Ambiente** - Conciencia ecológica y sostenibilidad
4. **Habilidades para la Vida** - Competencias prácticas

## 💳 Sistema de Pagos

### Integración MercadoPago

```typescript
// Configuración de pagos
declare var MercadoPago: any;

@Component({})
export class PaymentComponent {
  initMercadoPago() {
    MercadoPago.setPublishableKey(environment.mpPublicKey);
  }
  
  processPayment(paymentData: any) {
    return this.paymentService.createPreference(paymentData);
  }
}
```

### Funcionalidades de Pago

- **Procesamiento**: Tarjetas de crédito/débito
- **Cuotas**: Sistema de pagos recurrentes
- **Histórico**: Seguimiento completo de transacciones
- **Notificaciones**: Confirmaciones automáticas

## 🧪 Testing

### Tests Unitarios

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
ng test --include="**/auth.service.spec.ts"

# Coverage report
ng test --code-coverage
```

### Tests de Componentes

```typescript
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [HttpClientTestingModule]
    });
  });

  it('should login successfully', () => {
    // Test implementation
  });
});
```

## 🚀 Despliegue

### Build de Producción

```bash
# Build optimizado
ng build --prod

# Variables de entorno
ng build --configuration=production

# Análisis del bundle
ng build --prod --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

### Variables de Entorno

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.scout-josehernandez.com',
  mercadoPagoPublicKey: 'PROD_PUBLIC_KEY'
};
```

### Despliegue con Nginx

```nginx
server {
    listen 80;
    server_name scout-josehernandez.com;
    root /var/www/scout-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
    }
}
```

## 📈 Performance

### Optimizaciones

- **Lazy Loading**: Carga perezosa de módulos
- **OnPush**: Estrategia de detección de cambios optimizada  
- **TrackBy**: Funciones de seguimiento para ngFor
- **Bundle Splitting**: División de código por rutas
- **Service Workers**: Cache de recursos estáticos

### Métricas

- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s  
- **Time to Interactive**: < 4s
- **Bundle Size**: < 1MB gzipped

## 📝 Contribución

### Flujo de Desarrollo

1. Fork del repositorio
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Desarrollo con tests incluidos
4. Commit siguiendo conventional commits
5. Push y Pull Request

### Convenciones de Código

```typescript
// Nombres de componentes
export class ScoutDashboardComponent { }

// Nombres de servicios  
export class ScoutManagementService { }

// Interfaces
export interface ScoutMember { }

// Enums
export enum ScoutSection { }
```

### Linting y Formato

```bash
# ESLint
ng lint

# Prettier
npm run format

# Pre-commit hooks
npm run pre-commit
```

## 🐛 Debugging y Troubleshooting

### Problemas Comunes

**CORS Errors**
```typescript
// Verificar configuración del backend
// Endpoint: http://localhost:8080
// Allow-Origin: http://localhost:4200
```

**JWT Token Issues**
```typescript
// Verificar expiración en localStorage
const token = localStorage.getItem('token');
const decoded = jwt_decode(token);
console.log('Token expires:', new Date(decoded.exp * 1000));
```

**MercadoPago Integration**
```typescript
// Verificar carga del SDK
if (typeof MercadoPago === 'undefined') {
  console.error('MercadoPago SDK not loaded');
}
```

## 📞 Contacto

Para consultas sobre el proyecto:
- Email: tomas.colazo.federico@gmail.com

---

**Nota**: Este README está actualizado a junio 2025. Para la versión más reciente de la documentación, consultar el repositorio oficial.
