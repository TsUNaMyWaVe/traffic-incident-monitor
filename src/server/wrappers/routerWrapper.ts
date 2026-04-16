export const routerWrapper = async (func: () => Promise<any>, res: any) => {
    try {
        const response = await func();
        return res.status(200).send(response);
    } catch (error) {
        return res.status(400).send({ message: (error as Error).message });
    }
}