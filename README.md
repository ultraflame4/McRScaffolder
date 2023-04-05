# Minecraft Resourcepack Scaffolder
This tool allows you to easily scaffold (creating the initial file directories) and 
later manage & develop your resource pack.

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



## Notes to self

How to list out blocks and find their textures needed.<br>
This may also apply to items

1. To get a list of all block textures, use summary -> registries -> data.json, under key "block"

2. To find textures for that block, go to model -> data.json, and search for its key with "block/{block name here}".
    The value is a json object with model data for that block (with reference to the textures paths)

3. The model should have (it may not exist!) "textures" attribute that is also a json object.
    The key of the textures json object names the texture (eg. up, down, or simply "texture" if theres only 1)
    **The values are the resource names for the expected textures location in the resource pack**
