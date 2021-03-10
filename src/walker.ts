// @ts-nocheck

export function walkNodeProperties(cb: (s: string) => string, property: any): any {
    return {
        ...property,
        displayName: property.displayName && cb(property.displayName),
        description: property.description && cb(property.description),
        placeholder: property.placeholder && cb(property.placeholder),
        typeOptions: property.typeOptions && {
            ...property.typeOptions,
            multipleValueButtonText: property.typeOptions.multipleValueButtonText && cb(property.typeOptions.multipleValueButtonText),
        },
        options: property.options && (
            (property.type === 'options' || property.type === 'multiOptions') ? (property.options as any[]).map(option => ({
                    ...option,
                    name: option.name && cb(option.name),
                    description: option.description && cb(option.description),
                }))
                : property.type === 'fixedCollection' ? (property.options as any[]).map(option => ({
                    ...option,
                    displayName: option.displayName && cb(option.displayName),
                    values: option.values && option.values.map((value: any) => walkNodeProperties(cb, value)),
                }))
                : property.type === 'collection' ? (property.options as any[])
                        .map(option => walkNodeProperties(cb, option))
                    : property.options),
    };
}

export function walkNodeDescription(cb: (s: string) => string, description: any): any {
    return {
        ...description,
        description: cb(description.description),
        properties: description.properties.map(property => walkNodeProperties(cb, property)),
    };
}

export function walkNodeType(cb: (s: string) => string, nodeType: any): any {
    return {...nodeType, description: walkNodeDescription(cb, nodeType.description)};
}

export function walkCredentialType(cb: (s: string) => string, credentialType: any): any {
    return {
        ...credentialType,
        properties: credentialType.properties.map(property => walkNodeProperties(cb, property)),
    };
}
