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

### Creating an application with Auth0

When you go to the applications tab, you'll see that there's already an application named "Default App". This is just a placeholder; you can safely ignore it, or delete it if you want.

What you want to do is click the big orange "CREATE APPLICATION" button:

![The applications tab](deployment-screenshots/2.png)

You can give the Application any name you want, but be aware that this name will be publicly shown when the user logs in. This is an Angular project, so when prompted about the application type, select "Single-Page Web Applications".

![The dialog for creating a new application](deployment-screenshots/3.png)

After you create your Application, you'll be brought to this page:

![The page for your newly-created application](deployment-screenshots/4.png)

You can safely ignore the Quick Start—it's just a guide to how to use Auth0 in your codebase. Instead, you should take a look at the "Settings" tab.

There are five fields you need to set here.

 1. "Application Logo" should be set to `https://raw.githubusercontent.com/UMM-CSci-3601-S20/it-3-007/master/client/src/favicon.svg`, which points to the favicon as it appears in our GitHub repository. (You can also use a different image, if you so choose.)
 2. "Application Login URI" should be set to the root URL of the webpage, including the protocol. In our case, that's `https://172.105.105.10.nip.io`.
 3. "Allowed Callback URLs" should be a comma-separated list containing two items: First, `http://localhost:4200`, and second, the root URL of the webpage—which, again, is `https://172.105.105.10.nip.io` in our case. (The localhost URL is included in case you want to test the project on your own computer before deploying. If you're only ever going to run the project on a server, it may be safely omitted.)
 4. "Allowed Logout URLs" should be exactly the same as "Allowed Callback URLs": `http://localhost:4200, https://172.105.105.10.nip.io`.
 5. "Allowed Web Origins" should be exactly the same as "Allowed Callback URLs": `http://localhost:4200, https://172.105.105.10.nip.io`.

(You can leave "Allowed Origins (CORS)" empty.)

When you're finished, the applications settings should look like this:

![The first page of application settings](deployment-screenshots/5.png)

![The second page of application settings](deployment-screenshots/6.png)

*Remember to click the big blue "SAVE CHANGES" button at the bottom of the page! Otherwise, none of these settings will take effect.*

Also on the settings page, you'll find a randomly-generated Client ID; remember this value. In our example, the Client ID we got was **`fnDD76W87Xst7GsUrg0LbxOfIncrgLLz`**. (The Client ID isn't secret.)

You may also wish to look at the "Connections" tab and configure the settings there to your likings. By default, Auth0 is set up to let you create your own username and password, or to let you log in with Google, but you can add or remove login options as you see fit.

If you use anything other than username-password login, you should strongly consider acquiring your own API keys for the relevant websites. If you don't, Auth0 will provide you with "development" keys, but these aren't really meant for production use, and they may not work correctly.

When setting up social login options, it's important to keep in mind that DoorBoard is designed to be used within a single organization: it assumes that the local-part of users' email addresses (the part before the at-sign) is globally unique. If possible, you may wish to restrict login so that only users from a single organization may create accounts.
