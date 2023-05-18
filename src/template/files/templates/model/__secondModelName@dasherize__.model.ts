export class <%= classify(secondModelName) %>Light {
    <%= camelize(secondModelKey) %>: string;
}

export class <%= classify(secondModelName) %> extends <%= classify(secondModelName) %>Light{
    
}