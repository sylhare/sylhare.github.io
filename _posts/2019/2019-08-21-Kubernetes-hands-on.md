---
layout: post 
title: Kubernetes hands on and examples 
color: rgb(13,183,237)
tags: [kubernetes]
---

## Components Hands-on

To get a better grasp of kubernetes components and commands. You can set up a kubernetes cluster on your own following:
- [kubeadm installation script](https://github.com/sylhare/Linux/blob/master/Kubernetes/kubernetes.sh)

### Kubectl main commands

kubectl is a command line interface for running commands against Kubernetes clusters. In all of them, you can
replace `<component>` with any of the kubernetes component (pods, node, deployments, services, ...)

To get definition and information on the different kubernetes elements

```bash
kubectl explain <component>
```

To create a kubernetes component that is define inside the file.yaml. It uses the kubernetes API server to schedule the
creation of the component based on the yaml file.

```bash
kubectl create -f file.yaml
```

Give the basic information of the components, (number, status, Age)

```bash
kubectl get <component>

# Get the logs for one application / component
kubectl logs -l app=my-component
```

To remove a component.

```
kubectl delete <component's name>
```

Describe will give you the information of the scheduled component. If there is a name used for multiple component, you
can specify witch one using `<component>/<component's name>`

```
kubectl describe <component's name>
```

You can label components to organize your resources. It can then be used for network or access restrictions.

```
kubectl label <component> <component's name> env=test
```

### Pods

To create a pod, you need to specify its `kind`, `name` and then in `spec` the type of container that it is running.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: poddy
spec:
  containers:
    - name: poddy
      image: gcr.io/google_containers/echoserver:1.4
      ports:
        - containerPort: 8080
```

Each created pods have its own ip, they also have labels that are used to identify and query them.

> ImagePullPolicy, determines when to pull the image of the container(s) inside the pod. 
> It is recommended to put "always" so it always pull the image (to avoid some trouble).

### Replication controller

A ReplicationController ensures that a specified number of pod replicas are running at any one time. In other words, a
ReplicationController makes sure that a pod or a homogeneous set of pods is always up and available.

```yaml
kind: ReplicationController
metadata:
  name: poddy
spec:
  replicas: 2
  selector:
    app: poddy-app
  template:
    metadata:
      name: poddy
      labels:
        app: poddy-app
    spec:
      ... # Specs of the pod
```

Here we have 2 replicas of the specified pods named `poddy-<random stuff>` that will be created. The
replicationController finds the pods using their label here `poddy-app` - called a ReplicaSet.

- If you add another similar pods with the same label the replicationController will associate it and terminates one
  pods since it will have 3.

### Service

A Kubernetes Service is an abstraction which defines a logical set of Pods and a policy by which to access them -
sometimes called a micro-service. It is a group of pods acting as one, exposing the pods under one IP.

> Since ReplicaSet can kill and recreate Pods, the pod ips can change meaning you never know how to reach them.

Basically a service has:

- A static IP to reach the application
- A Selector to select the pods part of the service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: poddy-service
spec:
  type: "NodePort"
  ports:
    - port: 8080
      protocol: TCP
      targetPort: 8080
  selector:
    app: poddy-app
```

In service spec you can find the `type`, it can be either:

- ClusterIP: Exposes the service on a cluster-internal IP. Choosing this value makes the service only reachable from
  within the cluster using the `{NodeIP}`, it is the default.
- NodePort: Exposes the service on each Node’s IP at a static port (the NodePort). You’ll be able to contact the
  NodePort service, from outside the cluster, by requesting `{NodeIP}:{NodePort}`.

### Deployment

A deployment combines pods and replicaSets to create a desired state of the cluster.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  ... # Specs of the replicationController
  spec:
    ... # Specs of the pod(s)
```

Scale the deployment of an application, here the nginx app:

```bash
kubectl scale deployment nginx --replicas=3
```

Scale one or multiple deployment to 0 to remove any running resources in them: 

```shell
# In default namespace (or use --namespace=<namespace name> to scale down in a specific one)
kubectl get deployments -o jsonpath='{.items[*].metadata.name}' | xargs kubectl scale deployment --replicas=0
# To scale down all deployment in all namespace
kubectl get deployments --all-namespaces -o jsonpath='{range .items[*]}{@.metadata.namespace} {@.metadata.name} {end}' | xargs -n2 bash -c 'kubectl scale deployment $1 --replicas=0 --namespace=$0'
```

You can use the same command to scale them back up. 

### Namespace

A namespace is a way to separate your cluster or components. For example having a `prod` and a `test` namespace can help
deploy new software in the appropriate place.

Here is how we create a namespace

```bash
kubectl create namespace test
```

Or using a file, you can define your namespace like:

```yaml
kind: Namespace
apiVersion: v1
metadata:
  name: test
```

To create components inside that newly created "test" namespace:

```bash
kubectl create component-file.yaml -n test
```

To set that new namespace as the default namespace (When not specified `default` will be used as a namespace and for
every command):

```bash
kubectl config use-context test
```

To see which namespace you are in, you can use:

```bash
# To display the current one
kubectl config current-context
# To display the current one and the other available ones
kubectl config get-contexts
```

### Volumes

#### Persistent Volume

A PersistentVolume (PV) is a piece of storage in the cluster that has been provisioned by an administrator. It is a
resource in the cluster just like a node is a cluster resource.

The information there stays even if the pod dies, it's independent.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mysql-pv
  labels:
    vol: mysql
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/mysql-poddy
```

#### Persistent Volume Claim

A PersistentVolumeClaim (PVC) is a request for storage by a user. It allows a user to consume abstract storage
resources.

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: mysql-pv-claim
spec:
  storageClassName: ""
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  selector:
    matchLabels:
      vol: "mysql"
```

Here the pvc claim the above `mysql-pv` one, using the label in order to select it, and the `accessModes` for how it is
supposed to be accessed.

### Secrets

Kubernetes' secrets allow users to define sensitive information outside of containers and expose that information to
containers through environment variables as well as files within Pods.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: poddy-secret
type: Opaque
data:
  dbname: d29yZHByZXNzX2Ri
  dbuser: d29yZHByZXNzX3VzZXI=
  dbpassword: d29yZHByZXNzX3Bhc3M=
  mysqlrootpassword: cm9vdHBhc3MxMjM=
```

Secrets must be encoded first into base64, and put into `data`.

### Daemon Set

Daemon Set ensures that a copy of the pod runs on a selected set of nodes. By default, all nodes in the cluster are
selected. A selection criteria may be specified to select a limited number of nodes.

```yaml
kind: DaemonSet
metadata:
  name: poddy-daemonset
spec:
  selector:
    matchLabels:
      tier: monitoring
      name: poddy-exp
  template:
    metadata:
      labels:
        tier: monitoring
        name: poddy-exp
    spec:
      ... # Specs of the pod(s)
```

### Jobs

A Job creates one or more pods and ensures that a specified number of them successfully complete. A job keeps track of
successful completion of a pod. The job will start a new pod if the pod fails or is deleted due to hardware failure.

Jobs are complementary to Replica Set. A Replica Set manages pods which are not expected to terminate (e.g. web servers)
, and a Job manages pods that are expected to terminate (e.g. batch jobs).

#### Non Parallel Job

Only one pod per job is started, unless the pod fails. Job is complete as soon as the pod terminates successfully.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: poddy-job
spec:
  template:
    spec:
      ... # Specs of the pod(s)
```

#### Parallel Job

The number of pods to complete is defined by `.spec.completions` attribute (here `6`) in the configuration file. The
number of pods to run in parallel is defined by `.spec.parallelism` attribute (here `2` pods at the same time) in the
configuration file.

> The default value for both of these attributes is 1.

The job is complete when there is one successful pod for each value in the range in 1 to `.spec.completions`.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: poddy-parallel-job
spec:
  completions: 6
  parallelism: 2
  template:
    metadata:
      name: poddy
    spec:
      ... # Specs of the pod with the same name as in template.metadata
```

#### Cron Job

A Cron Job is a job that runs on a given schedule, written in Cron format. There are two primary use cases:

- Run jobs once at a specified point in time
- Repeatedly at a specified point in time

```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: poddy-cron
spec:
  schedule: "*/1 * * * *"
  jobTemplate:
    spec:
      template:
        metadata:
          labels:
            app: poddy-app
        spec:
          ... # Specs of the pod with the same name as in template.metadata
```

### Ingress

An Ingress Controller - is an application that watches the Master Node's API Server for changes in the Ingress resources
and updates the Layer 7 load balancer accordingly. Ingress-Controller is a mandatory prerequisite for Ingress rules to
start working in Kubernetes.

Kubernetes has different options of Ingress Controllers, and, if needed, we can also build our own. Most popular Ingress
Controllers implementations are `Haproxy`, `Traefic`, `Nginx`.

Find all the ingresses in your cluster for all namespaces using:

```shell
kubectl get ingress -A 
```

This will list them, displaying among other things their name, hosts and ports.

#### NetworkPolicy

```yaml
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: access-nginx
  namespace: policy-demo
spec:
  podSelector:
    matchLabels:
      run: nginx
  ingress:
    - from:
        - podSelector:
            matchLabels:
              run: access
```

#### Single service ingress

The simple ingress usage is with one address, and one service associated to it. The service associated needs to
have `CLusterIP` in the `spec.type`.

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: poddy-ingress
spec:
  rules:
    - http:
        paths:
          - path: /
            backend:
              serviceName: poddy-service
              servicePort: 80
      host: poddy.com
```

#### Simple fanout

This time we're going to deploy Simple fanout type that exposing multiple services on same host, but via different
paths. This type is very handy when you running in CloudProvider and want to cut cost on creating LoadBalancers for each
of you application.

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: simple-fanout-rules
spec:
  rules:
    - host: poddy.com
      http:
        paths:
          - path: /hello                            # poddy.com/hello
            backend:
              serviceName: poddy-service-1
              servicePort: 80
          - path: /world                            # poddy.com/world
            backend:
              serviceName: poddy-service-2
              servicePort: 80
```
