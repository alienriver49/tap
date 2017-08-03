// Settings for authentication 

export var config = {
  loginRedirect: '/',
  tokenPrefix: 'TylerId',  
  baseUrl: 'https://fdvmdevtid1.tylertech.com/app/IDPTokenServer/identity',
  profileUrl: '/connect/userinfo',
  providers: {
    TylerId : {
      name: 'TylerId',
      url: '',
      authorizationEndpoint: 'https://fdvmdevtid1.tylertech.com/app/IDPTokenServer/identity/connect/authorize', //if this ends with slash --> game over
      clientId: 'munisAngularClient',
      responseType: 'token',
      scope: ['munisWebApi'],
      scopeDelimiter: ' ',
      state: '',  // Where do we get the value for this param??
      nonce: () => Math.random(),
      redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
      requiredUrlParams: ['scope', 'nonce', 'state'],
      optionalUrlParams: [],
      type: '2.0'
    }
  }
};
