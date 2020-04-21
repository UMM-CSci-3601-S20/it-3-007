import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/authentication/auth.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Auth0Client, IdToken, RedirectLoginResult } from '@auth0/auth0-spa-js';
import { environment } from 'src/environments/environment';

@Injectable()
export class MockAuthService extends AuthService {
  constructor() {
    super(null);
    this.auth0Client$ = of(new MockAuth0Client());
  }
}

export class MockAuth0Client extends Auth0Client {
  constructor() {
    super({
      domain: environment.AUTH_DOMAIN,
      client_id: environment.AUTH_CLIENT_ID,
      redirect_uri: environment.BASE_URL,
      audience: environment.AUTH_API_DOMAIN,
    });
  }

  // Change the value of this property to control how MockAuth0Client
  // behaves during testing.
  mockAccessToken = 'La la la! I\'m a JSON Web Token!';

  // See https://auth0.com/docs/api/management/v2#!/Users/get_users
  john = {
    user_id: 'auth0|507f1f77bcf86cd799439020',
    email: 'john.doe@gmail.com',
    email_verified: false,
    username: 'johndoe',
    phone_number: '+199999999999999',
    phone_verified: false,
    created_at: '',
    updated_at: '',
    identities: [
      {
        connection: 'Initial-Connection',
        user_id: '507f1f77bcf86cd799439020',
        provider: 'auth0',
        isSocial: false
      }
    ],
    picture: '',
    name: '',
    nickname: 'doe00003',
    multifactor: [
      ''
    ],
    last_ip: '',
    last_login: '',
    logins_count: 0,
    blocked: false,
    given_name: '',
    family_name: ''
  };

  // See https://github.com/auth0/auth0-spa-js/blob/178b65f30c9b7a76ce762a1b4de1bd3ccfca5e5a/src/global.ts#L282
  johnsIdToken: IdToken = {
    __raw: '',
    name: this.john.name,
    given_name: this.john.given_name,
    family_name: this.john.family_name,
    nickname: this.john.nickname,
    picture: this.john.picture,
    email: this.john.email,
    email_verified: this.john.email_verified,
    phone_number: this.john.phone_number,
    phone_number_verified: this.john.phone_verified,
    updated_at: this.john.updated_at,
    iss: environment.AUTH_DOMAIN,
    aud: environment.AUTH_API_DOMAIN,
  }

  loginWithPopup() {
    return new Promise<void>(() => {});
  }

  getUser() {
    return new Promise<any>(() => this.john);
  }

  getIdTokenClaims() {
    return new Promise<IdToken>(() => this.johnsIdToken)
  }

  loginWithRedirect() {
    return new Promise<void>(() => {});
  }

  handleRedirectCallback() {
    return new Promise<RedirectLoginResult>(() => {
      return {};
    });
  }

  getTokenSilently() {
    return new Promise<string>(() => this.mockAccessToken);
  }

  getTokenWithPopup() {
    return new Promise<string>(() => this.mockAccessToken);
  }

  isAuthenticated() {
    return new Promise<boolean>(() => true);
  }

  logout() {}
}
