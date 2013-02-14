webdrain
========

This web app runs two services:

  * TCP service, via Harbor, acting as a Drain
  * Web service, exposing via websockets the contents received on the Drain

The TCP port number will be published on the web app. You can also run
`stackato service webdrain-tcp` to retrieve it.