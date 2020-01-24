import { bootstrapServer } from '../server';
import { bootstrapManagement, COMMAND_ARG } from '../management';

export async function bootstrapApplication(appModule: any) {
   if (process.argv.includes(COMMAND_ARG)) {
       await bootstrapManagement(appModule);
   } else {
       await bootstrapServer(appModule);
   }
}
