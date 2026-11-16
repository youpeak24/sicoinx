import { Router } from 'express';
import { authRouter } from './auth.routes';
import { coinRouter } from './coin.routes';
import { contentRouter } from './content.routes';
import { userRouter } from './user.routes';
import { adminRouter } from './admin.routes';
import { publicRouter } from './public.routes';
import { walletRouter } from './wallet.routes';
import { tradeRouter } from './trade.routes';
import { paymentsRouter } from './payments.routes';
import { kycRouter } from './kyc.routes';
import { ecosystemPartnerRouter } from './ecosystemPartner.routes';
import { chatRouter } from './chat.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/coin', coinRouter);
apiRouter.use('/content', contentRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/public', publicRouter);
apiRouter.use('/chat', chatRouter); // AI assistant (Groq), see lib/chatContext.ts

// SIcoinX Core Financial & Platform Routes
apiRouter.use('/wallet', walletRouter);
apiRouter.use('/trade', tradeRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/kyc', kycRouter);
apiRouter.use('/ecosystem/partner', ecosystemPartnerRouter);
