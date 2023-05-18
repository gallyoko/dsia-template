export class <%= classify(principalModelName) %>Light {
    <%= camelize(principalModelKey) %>: string;
}

export class <%= classify(principalModelName) %> extends <%= classify(principalModelName) %>Light{
    
}