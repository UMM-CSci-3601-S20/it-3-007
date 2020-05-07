# Deployment

To deploy this project, you're going to need to acquire a server running some flavor of Linux. You'll need the `docker-compose` and `git` commands; depending on your distribution, you may need to install these onto the server before continuing.

You're also going to need a domain name that points to your server's IP address. (If you don't want to buy a domain name, consider using [nip.io](https://nip.io/); this is a website with the property that, if you take an arbitrary IP address—say, 172.105.105.10—the domain name `172.105.105.10.nip.io` will automatically point to that IP address.)

Let's suppose we're using the domain **`172.105.105.10.nip.io.`**

## Authentication

This project uses the identity service Auth0 for authentication. To use this service, you'll need to create an account at [auth0.com](https://auth0.com/). They will ask you to create a "tenant domain" of the form `something.auth0.com`. (This is where your login page and related URLs will live.) Choose whatever name you want, and write it down.

Let's suppose our tenant domain is **`my-doorboard-tenant.auth0.com`**.

You should be redirected to your Auth0 dashboard, which looks like this:

![The Auth0 dashboard](deployment-screenshots/1.png)

To deploy the project, you're going to need to create two things: first, an application, under the "Applications" page, and second, an API, under the "APIs" page. (The Application contains settings for the client-side; the API contains settings for the server-side.)
