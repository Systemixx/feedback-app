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
        DOCKER_CREDENTIALS_ID = 'dockerhub-token'
        DOCKER_REPO = 'chrisneidl/feedback-app-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_IMAGE = "${DOCKER_REPO}:${IMAGE_TAG}"
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
                echo 'Push successful.'
            }
        }

        stage('Kubernetes Deploy Frontend') {
            steps {
                echo 'Deploying frontend to Kubernetes...'
                container('kubectl') {
                    script {
                        sh 'sed -i "s|image: galaataman/feedback-app-frontend:latest|image: $DOCKER_IMAGE|g" kubernetes/frontend-deployment.yaml'
                        sh 'kubectl apply -f kubernetes/frontend-deployment.yaml'
                    }
                } 
                echo 'Frontend deployment successful.'
            }
        }

        stage('Check Frontend Status') {
            steps {
                echo 'Checking if the frontend is reachable...'
                script {
                    def retries = 30
                    def delay = 10
                    def url = "http://feedback-app-frontend-service:3000"

                    for (int i = 0; i < retries; i++) {
                        def result = sh(script: "curl -s -o /dev/null -w '%{http_code}' $url", returnStdout: true).trim()

                        if (result == '200') {
                            echo 'Frontend is reachable!'
                            break
                        } else {
                            echo "Frontend health check ${i + 1}: HTTP $result . Retrying in ${delay} seconds."
                        }

                        if (i == retries -1) {
                            error "Frontend is unreachable after ${retries} attempts."
                        }

                        sleep delay
                    }
                }
            }
        }

        stage('Integration Tests') {
            steps {
                echo 'Running frontend integration tests...'
                container('k6') {
                    sh 'k6 run --env BASE_URL=http://feedback-app-frontend-service:3000 ./tests/frontend.integration.js'
                }
                echo 'Frontend integration tests ready.'
            }
        }
    }

    post {
        always {
            echo 'Post: DockerHub URL...'
            script {
                def dockerHubUrl = "https://hub.docker.com/r/${DOCKER_REPO}/tags?name=${IMAGE_TAG}"
                echo "DockerHub URL for the build: ${dockerHubUrl}"
            }
        }
        success {
            echo 'Build successful, pushing the image as latest...'
            container('docker') {
                script {
                    docker.withRegistry('', "${DOCKER_CREDENTIALS_ID}") {
                        sh "docker tag ${DOCKER_IMAGE} ${DOCKER_REPO}:latest"
                        sh "docker push ${DOCKER_REPO}:latest"
                    }
                }
            }
            echo 'The latest Docker image successfully updated.'
        }
    }   
}
