# Vindicat — versión inicial

## Contenido
- `index.html`: interfaz premium adaptable a celular.
- `api/asesoria.js`: función serverless `POST /api/asesoria` que llama a OpenAI desde el servidor.
- `package.json`: activa módulos ES.
- `.gitignore`: evita subir archivos de entorno.

## Instalación desde Android/GitHub
1. En el repositorio `camilomona990803/Vindicat`, reemplaza `index.html` por el de este paquete.
2. En GitHub, crea la carpeta `api` y dentro el archivo `asesoria.js`; pega el archivo correspondiente.
3. Añade o reemplaza `package.json` en la raíz.
4. Añade `.gitignore` en la raíz.
5. Confirma los cambios en la rama que Vercel tiene conectada (la captura mostraba `principal`; confirma en Vercel si esa sigue siendo la rama de producción).
6. Vercel normalmente desplegará automáticamente. Revisa Deployments.

## Configurar IA (no pegar la clave en GitHub)
1. Crea una clave de API en la plataforma de OpenAI y revisa sus condiciones, saldo y límites.
2. En Vercel: proyecto → Settings → Environment Variables.
3. Crea `OPENAI_API_KEY` y pega ahí la clave secreta. Activa Production y Preview según lo que vayas a probar.
4. Opcionalmente crea `OPENAI_MODEL` con un modelo disponible en tu cuenta, por defecto el código usa `gpt-4.1-mini`.
5. Guarda y vuelve a desplegar (Redeploy) para que las variables estén disponibles.
6. Prueba con hechos ficticios; no uses datos personales reales al comienzo.

## Límites importantes antes de usar con clientes
- La IA puede equivocarse. El contenido es orientación informativa, no representación legal.
- La descarga genera un archivo HTML compatible con Word, como borrador; revisa y completa el documento antes de presentarlo.
- Los pagos están deshabilitados intencionalmente. No aceptes transferencias ni muestres “pago verificado” hasta integrar un proveedor y validar la confirmación desde el servidor/webhook.
- Este prototipo no tiene login, base de datos, cuotas por usuario ni protección avanzada contra abuso; un endpoint público podría consumir tu saldo de API. Antes de anunciarlo al público, añade limitación de uso y control de costes.
- El aviso de privacidad de la página es provisional. Antes de tratar datos de clientes, publica política de tratamiento de datos conforme a las obligaciones colombianas aplicables, revisa el uso de proveedores externos y define conservación, eliminación y canal de derechos.
- No garantices eliminación de multas, embargos o reportes.
