import type { Class as BaseClass, Constructor, EmptyObject } from "type-fest"

// Here I'm adding the constructor function to a class instance type,
// because in plain javascript it's also possible to access
// the constructor function from a class instance.
// AND, just like in plain JS, the constructor function
// gives access to the class' static methods and members.
type AddConstructorFnWithStatic<
  Prototype,
  StaticStuff = EmptyObject,
  ConstructorArgs extends unknown[] = any[],
> = Prototype & {
  constructor: StaticStuff & Constructor<Prototype, ConstructorArgs>
}

// This augmented Class type allows one to define
// expected static methods and members on classes.
type Class<
  Prototype,
  StaticStuff = EmptyObject,
  ConstructorArgs extends unknown[] = any[],
> = StaticStuff & BaseClass<
  AddConstructorFnWithStatic<
    Prototype,
    StaticStuff,
    ConstructorArgs
  >,
  ConstructorArgs
>

// These are the methods I care about
// and would prefer to add to a class statically,
// instead of as instance members, even though that
// would make my life significantly easier.
type SerializeMethods<T, U> = {
  serialize: (instance: T) => U
  unserialize: (serialized: U) => T
}

// So this type defines a Class type that includes
// the two static methods for (un)serializing you see above.
export type Serializable<T = any, U = any> = Class<T, SerializeMethods<T, U>>

type Path = `${string}[${string}]`
const classRegister = new Map<Serializable, Path>()

export function registerClasses(serializableClasses: Record<Path, Serializable>) {
  const promises = Object.entries(serializableClasses).map(async ([fullPath, classType]) => {
    const match = fullPath.match(/^(.+)\[(\w+)\]$/)
    
    if (!match) throw new Error(`Path "${fullPath}" does not match pattern "{string}[{string}]".`)
    const [, path, symbol] = match
    
    if (!("serialize" in classType) || typeof classType.serialize !== "function" || classType.serialize.length !== 1)
      throw new TypeError(classType.name + " does not correctly implement the static method `serialize(instance: T): U`.")

    if (!("unserialize" in classType) || typeof classType.unserialize !== "function" || classType.unserialize.length !== 1)
      throw new TypeError(classType.name + " does not correctly implement the static method `unserialize(serialized: U): T`.")

    const parts = path.split("/")

    if (parts.length === 1)
      throw new Error("Cannot register classes imported from the root `src` directory.")

    const importedClassType = parts.length === 2
      ? (await import(`./${parts[0]}/${parts[1]}.ts`))[symbol]
      : parts.length === 3
      ? (await import(`./${parts[0]}/${parts[1]}/${parts[2]}.ts`))[symbol]
      : (await import(`./${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}.ts`))[symbol]
    
    if (importedClassType !== classType)
      throw new Error(`Path "${fullPath}" does not resolve to given class "${classType.name}".`)

    classRegister.set(classType, fullPath as Path)
  })

  return Promise.all(promises)
}

export type SerializedData<U = any> = {
  class: Path
  data: U
}

export function serialize<T extends { constructor: Function }, U>(instance: T): SerializedData<U> {
  const classType = instance.constructor as Serializable<T, U>
  
  if (!classRegister.has(classType))
    throw new Error(`Class ${classType.name} is not registered.`)

  const path = classRegister.get(classType)
  
  return { class: path, data: classType.serialize(instance) }
}

export async function unserialize<U, T = any>(data: SerializedData<U>): Promise<T> {
  const [, path, symbol] = data.class.match(/^(.+)\[(\w+)\]$/)
  
  const parts = path.split("/")

  const classType: Serializable = parts.length === 2
    ? (await import(`./${parts[0]}/${parts[1]}.ts`))[symbol]
    : parts.length === 3
    ? (await import(`./${parts[0]}/${parts[1]}/${parts[2]}.ts`))[symbol]
    : (await import(`./${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}.ts`))[symbol]
  
  return classType.unserialize(data.data)
}
