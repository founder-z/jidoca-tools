#!/usr/bin/env node

import {Command} from 'commander';
import * as fs from 'fs';

function collect(value: string, previous: string[]) {
    return previous.concat([value]);
}

new Command()
    .arguments('<file>')
    .description('Rescope provided package', {
        file: 'Path to package.json'
    })
    .requiredOption('-p, --package <value>', 'Target package name (can use multiple times)', collect, [])
    .option('-s, --suffix <value>', 'Version suffix')
    .option('-c, --scope <value>', 'Version suffix', '@founder-z')
    .option('-r, --repository <value>', 'Repository URL', 'git+https://github.com/founder-z/n8n')
    .action((file, {package: packages, suffix, scope, repository}) => {
        const result: string[] = [];
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));

        content.name = scope + '/' + content.name;
        content.repository.url = repository;

        if (suffix) {
            content.version = content.version + '-' + suffix;
        }

        result.push(content.name + '@' + content.version);

        Object.keys(content.dependencies).map(function (name) {
            if (packages.includes(name)) {
                content.dependencies[scope + '/' + name] = suffix
                    ? content.dependencies[name] + '-' + suffix
                    : content.dependencies[name];
                delete content.dependencies[name];

                result.push(scope + '/' + name + '@' + content.dependencies[scope + '/' + name]);
            }
        });

        fs.writeFileSync(file, JSON.stringify(content, undefined, 4));

        for (let i of result) {
            console.log(i);
        }
    })
    .parse();

