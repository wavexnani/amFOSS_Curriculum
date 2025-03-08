#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <errno.h>

#define MAX_CMD_LEN 1024
#define MAX_ARGS 100

// Function to handle the 'cd' command
void change_directory(char *path) {
    if (path == NULL) {
        // If no path is given, change to home directory
        path = getenv("HOME");
    }
    
    if (chdir(path) != 0) {
        perror("cd error");
    }
}

// Function to parse and execute commands
void execute_command(char *command) {
    pid_t pid;
    char *args[MAX_ARGS];
    char *token;
   

    // Parse the command line into tokens
    token = strtok(command, " \n");
    int i = 0;
    while (token != NULL) {
        
            args[i] = token;
            i++;
        
        token = strtok(NULL, " \n");
    }
    args[i] = NULL;  // Null-terminate the arguments

    if (args[0] == NULL) {
        // Empty command (just hit enter)
        return;
    }
    
    if (strcmp(args[0], "exit") == 0) {
        printf("Shell is Closing \n");
        exit(0);
    }

    // Handle built-in commands (cd)
    if (strcmp(args[0], "cd") == 0) {
        if (i > 1) {
            change_directory(args[1]);
        } else {
            change_directory(NULL);
        }
        return;
    }

    // Fork a child process to execute the command
    pid = fork();
    if (pid == -1) {
        perror("Fork failed");
        exit(1);
    } else if (pid == 0) {
        // In the child process
        if (execvp(args[0], args) == -1) {
            perror("Execution failed");
            exit(1);
        }
    } else {
        // In the parent process
        // Wait for the child process to finish if not a background process
        waitpid(pid, NULL, 0);
    }
}

int main(void) {
    char command[MAX_CMD_LEN];
    
    // Main shell loop
    while (1) {
        // Display the prompt
        char cwd[1024];
        if (getcwd(cwd, sizeof(cwd)) != NULL) {
            printf("%s$ ", cwd);
        } else {
            perror("getcwd error");
            exit(1);
        }

        // Read user input using getline
        if (fgets(command, sizeof(command), stdin) == NULL) {
            perror("fgets error");
            exit(1);
        }

        // Execute the command
        execute_command(command);
    }

    return 0;
}
