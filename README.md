# PostgreSQL: Harnessing Advanced Features with Architectural Simplicity.

Exploring Postgres 17 via demo of Postgres-only Slack Shared Todo App

For backend with the scheduled worker service, see https://github.com/humble92/todo-pg

(Backend & Postgres in this repo exists for easier development of fronend side)


### Tip. On K8s

Set `BACKEND_URL`:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-app
  labels:
    app: frontend-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend-app
  template:
    metadata:
      labels:
        app: frontend-app
    spec:
      containers:
        - name: frontend-app
          image: humble92/todo-frontend:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
          env:
            - name: BACKEND_URL
              value: "http://fastapi-service:8000"
```