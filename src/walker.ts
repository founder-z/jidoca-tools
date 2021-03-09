import {
    ICredentialType,
    INodeProperties,
    INodePropertyCollection,
    INodePropertyOptions, INodeType,
    INodeTypeDescription
} from "n8n-workflow";

export function walkNodeProperties(cb: (s: string) => string, property: INodeProperties): INodeProperties {
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
            (property.type === 'options' || property.type === 'multiOptions') ? (property.options as INodePropertyOptions[]).map(option => ({
                    ...option,
                    name: option.name && cb(option.name),
                    description: option.description && cb(option.description),
                }))
                : property.type === 'fixedCollection' ? (property.options as INodePropertyCollection[]).map(option => ({
                    ...option,
                    displayName: option.displayName && cb(option.displayName),
                    values: option.values && option.values.map((value: INodeProperties) => walkNodeProperties(cb, value)),
                }))
                : property.type === 'collection' ? (property.options as INodeProperties[])
                        .map(option => walkNodeProperties(cb, option))
                    : property.options),
    };
}

export function walkNodeDescription(cb: (s: string) => string, description: INodeTypeDescription): INodeTypeDescription {
    return {
        ...description,
        description: cb(description.description),
        properties: description.properties.map(property => walkNodeProperties(cb, property)),
    };
}

export function walkNodeType(cb: (s: string) => string, nodeType: INodeType): INodeType {
    return {...nodeType, description: walkNodeDescription(cb, nodeType.description)};
}

export function walkCredentialType(cb: (s: string) => string, credentialType: ICredentialType): ICredentialType {
    return {
        ...credentialType,
        properties: credentialType.properties.map(property => walkNodeProperties(cb, property)),
    };
}
