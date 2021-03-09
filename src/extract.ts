import PO from 'pofile';
import {Command} from 'commander';
import fs from "fs";
import path from "path";
import {walkCredentialType, walkNodeType} from "./walker";

new Command()
    .arguments('<directory>')
    .description('Extracts translation string from nodes and credentials in given directory', {
        directory: 'Path to package directory'
    })
    .option('-o, --output <value>', 'Output file path. Omit to print to stdout.')
    .action((directory, {output}) => {
        const po = new PO();

        po.headers = {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Transfer-Encoding': '8bit',
            'Generated-By': 'jidoca-tools',
            'Project-Id-Version': '',
        };

        function add(reference: string, id: string) {
            const poItem = new PO.Item();
            poItem.msgid = id;
            poItem.references = [reference];
            poItem.msgstr = [''];
            po.items.push(poItem);
            return id;
        }

        const {n8n, name: packageName} = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));

        for (let relativePath of [...(n8n?.nodes || []), ...(n8n?.credentials || [])]) {
            const absolutePath = path.resolve(path.join(directory, relativePath));
            const [name, type] = path.parse(absolutePath).name.split('.');
            const module = require(absolutePath);
            const walker = type == 'credentials' ? walkCredentialType
                : type == 'node' ? walkNodeType : undefined;

            if (walker) {
                walker(
                    add.bind(undefined, packageName + ': ' + relativePath),
                    new module[name]()
                )
            }
        }

        const content = po.toString();

        if (output) {
            fs.writeFileSync(output, content);
        } else {
            console.log(content);
        }
    })
    .parse();
