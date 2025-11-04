// Importa a versão do package.json para manter sincronizado
// @ts-ignore - package.json não tem tipos
import packageJson from '../../package.json';

/**
 * Versão da aplicação (vem do package.json)
 * Formato: vX.Y.Z (Semantic Versioning)
 */
export const APP_VERSION = `v${packageJson.version}`;

/**
 * Nome da aplicação
 */
export const APP_NAME = 'Licenciamento Ambiental - Integração';

/**
 * Data de build (gerada em tempo de compilação)
 */
export const BUILD_DATE = new Date().toISOString().split('T')[0];

/**
 * Informações completas da versão
 */
export const VERSION_INFO = {
  version: APP_VERSION,
  name: APP_NAME,
  buildDate: BUILD_DATE,
  fullName: `${APP_NAME} ${APP_VERSION}`
};

/**
 * Loga informações da versão no console
 */
export function logVersionInfo() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ${APP_NAME.padEnd(55)} ║
║  Versão: ${APP_VERSION.padEnd(49)} ║
║  Build: ${BUILD_DATE.padEnd(50)} ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}
