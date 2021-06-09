import { ValAscendente } from "./ValAscendente";

export class RepGramAscXML 
{
    private static instance: RepGramAscXML;
    lista: ValAscendente[];

    private constructor() 
    {
        this.lista = [];
    }

    public static getInstance(): RepGramAscXML 
    {
        if (!RepGramAscXML.instance) 
        {
            RepGramAscXML.instance = new RepGramAscXML();
        }
        return RepGramAscXML.instance;
    }

    public push(valor: ValAscendente): void 
    {
        //unshift para agregar un dato al inicio
        //push para agregar un dato al final    
        this.lista.unshift(valor);
    }

    public clear(): void 
    {
        this.lista = [];
    }

    public hasProd(): boolean 
    {
        return this.lista.length > 0;
    }

    public getText(): ValAscendente[] 
    {
        return this.lista;
    }
}