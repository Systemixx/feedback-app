pipeline {
    agent {
        kubernetes {
            label 'jenkins-docker-agent'
            yamlFile 'kubernetes_jenkins/jenkins-pod-template.yaml'
        }
    }

    triggers {
        pollSCM('H/2 * * * *')  // Prüft alle 2 Minuten auf Änderungen im SCM
    }

    environment {
        GITHUB_REPO = 'https://github.com/Systemixx/feedback-app-frontend.git'
        DOCKER_IMAGE = 'chrisneidl/feedback-app-frontend:pipeline-test'
        DOCKER_CREDENTIALS_ID = 'dockerhub-token'
    }

    stages {
        stage('Checkout') {
            steps {
                git url: "${GITHUB_REPO}", branch: 'main'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing frontend dependencies...'
                container('node') {
                    sh 'npm install'
                }
                echo 'Dependencies installed.'
            }
        }

        stage('Linting') {
            steps {
                echo 'Running ESLint...'
                container('node') {
                    sh 'npm run lint'
                }
                echo 'Linting completed.'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo 'Running unit tests...'
                container('node') {
                    sh 'npm test'
                }
                echo 'Unit tests completed.'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building the frontend app...'
                container('node') {
                    sh 'npm run build'
                }
                echo 'Build successful.'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                container('docker') {
                    sh 'docker build -t $DOCKER_IMAGE .'
                }
                echo 'Docker image build successful.'
            }
        }

        stage('Docker Push') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'
                container('docker') {
                    script {
                        docker.withRegistry('', "${DOCKER_CREDENTIALS_ID}") {
                            sh 'docker push $DOCKER_IMAGE'
                        }
                    }
                }
                echo 'Docker push successful.'
            }
        }

        stage('Kubernetes Deploy Frontend') {
            steps {
                echo 'Deploying to Kubernetes...'
                container('kubectl') {
                    sh 'kubectl apply -f kubernetes/frontend-deployment.yaml'
                }
                echo 'Deployment successful.'
            }
        }

        stage('E2E Tests') {
            steps {
                echo 'Running End-to-End tests...'
                container('node') {
                    sh 'npm run e2e'
                }
                echo 'E2E tests completed.'
            }
        }
    }
}
