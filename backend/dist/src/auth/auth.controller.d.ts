import { AuthService } from './auth.service';
import { SignupDto, LoginDto, VerifyTenantDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(dto: SignupDto): Promise<{
        accessToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
    }>;
    getProfile(req: any): Promise<{
        email: string;
        name: string;
        cnicNumber: string | null;
        id: string;
        isVerified: boolean;
        verificationStatus: string;
    }>;
    verifyTenant(req: any, dto: VerifyTenantDto): Promise<{
        email: string;
        name: string;
        cnicNumber: string | null;
        id: string;
        isVerified: boolean;
        verificationStatus: string;
    }>;
}
