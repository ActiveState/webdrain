webdrain
========

Logyard drain as a web app.

```
$ stackato push -n
...
$ stackato service webdrain-tcp
...
```

Note down the port from that last command. And then setup a drain
like:

```
$ kato log drain add webdrain tcp://stackato-xyza.local:12345/
```

Watch the log messages come in.

