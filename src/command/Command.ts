export default abstract class Command {

    public abstract execute(command: string): Promise<void>;

    public normalExit(): void {
        process.exit(0);
    }

    public errorExit(): void {
        process.exit(1);
    }

    private getArg(key: string, check?: (value: string) => boolean): string | null {
        const index = process.argv.indexOf(key);
        if (index < 0) return null;
        const value = process.argv[index + 1];
        return check ? (check(value) ? value : null) : value;
    }

    protected haveArg(key: string): boolean {
        const index = process.argv.indexOf(key);
        return index >= 0;
    }

    protected getStringArg(key: string, defaultValue?: string): string {
        const arg = this.getArg(key, value => value && !value.startsWith('-'));
        return arg || defaultValue;
    }

    protected getNumberArg(key: string, defaultValue?: number): number {
        const arg = this.getStringArg(key);
        let numberArg: number = defaultValue;
        try { numberArg = Number(arg); }
        catch (e) { numberArg = defaultValue; }
        return numberArg;
    }

    protected getBooleanArg(key: string, defaultValue?: boolean): boolean {
        const arg = this.getStringArg(key);
        let booleanArg: boolean = defaultValue;
        if (arg === 'true') booleanArg = true;
        else if (arg === 'false') booleanArg = false;
        return booleanArg;
    }
}