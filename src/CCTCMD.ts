const runner = async (): Promise<void> => {

    const command = process.argv[2];
    switch (command) {
        default:
            console.error(`Error Command: ${command}`);
            process.exit(1);
    }
}

runner();