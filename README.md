# Minecraft Resourcepack Scaffolder

This tool allows you to easily scaffold (creating the initial file directories) and
later manage & develop your resource pack.

## Usage & Explanations

Install with : `npm install mcrscaffolder`.

Execute `npx mcrs --help` to see help options.

### Main menu options

After you first create a new project or open an existing one,<br>
you will be presented with several options in the main menu.

| Name          | Description                                                                                                                                                                                            |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| New Item      | Downloads & adds the textures used for a given block into the project                                                                                                                                  |
| New Block     | Downloads & adds the textures used for a given block into the project                                                                                                                                  |
| New Texture   | Downloads & adds a new texture into the project.                                                                                                                                                       |
| New Shader    | (1.17+) Downloads & adds the shader files for a given shader                                                                                                                                           |
| Watch & Sync  | (in development) Watches the project files for changes and sync them to the minecraft resource pack folder.<br/>Hence you only need to reload (and equip) the resource pack (F3+T) to see the changes. |
| Settings      | For development and other stuff                                                                                                                                                                        |
| Exit (Ctrl+C) | Exits the program                                                                                                                                                                                      |

The `New Item` & `New Block` options exists as `New Texture` only adds a single texture whereas
`New Item` & `New Block` may add multiple textures if needed for the specific block/item

### Sources

This project relies on data provided by https://github.com/misode/mcmeta repository

## Planned features

### 1. Dynamic Scaffolding

Creates the necessary file structure needed for the resourcepack.

It will dynamically create file structure as needed for the various types of resources.

For example:
When you want to create , for example, lets say a diamond sword texture, you do something like:

```
// Insert mcrs cli here

> create item <insert id for diamond sword>
```

And then it will create the files (and parent folders) needed for the diamond sword texture

### 2. File Watch & Sync

When changes are made, it copies them from your development folder and into minecraft's resourcepacks folder.
This allows you to:

1. Develop your resourcepack in another file location.
2. Not manually copy files back and forth. You only need to reload the resourcepack in minecraft ( with F3 + T )


