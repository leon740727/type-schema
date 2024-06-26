import { not, toPairs, zip } from "ramda";
import { Optional } from "types";
import {
  Schema,
  SchemaType,
  AtomSchema,
  InnerSchemaForObjectSchema,
} from "./type";
import { assert, pair } from "./util";

type Error = {
  paths: string[];
  msg: string;
};

export function check(schema: Schema, value): Optional<string> {
  return _check(schema, value).map(error2string);
}

function error2string(error: Error) {
  if (error.paths.length > 0) {
    return `obj.${error.paths.join(".")} ${error.msg}`;
  } else {
    return error.msg;
  }
}

function _check(schema: Schema, value): Optional<Error> {
  if (value === null && schema.isNullable) {
    return Optional.empty();
  }
  if (value === undefined && schema.isOptional) {
    return Optional.empty();
  }
  if (schema.type === SchemaType.object) {
    if (typeof value === "object" && value !== null) {
      // typeof null === 'object'
      assert(schema.innerSchema, "object inner schema is null or undefined");
      return checkObject(schema.innerSchema, value);
    } else {
      return Optional.of({
        paths: [],
        msg: "is not an object",
      });
    }
  } else if (schema.type === SchemaType.array) {
    if (value instanceof Array) {
      return checkArray(schema.itemSchema, value);
    } else {
      return Optional.of({
        paths: [],
        msg: "is not an Array",
      });
    }
  } else if (schema.type === SchemaType.tuple) {
    if (value instanceof Array) {
      assert(schema.innerSchema, "tuple inner schema is null or undefined");
      return checkTuple(schema.innerSchema, value);
    } else {
      return Optional.of({
        paths: [],
        msg: "is not a tuple",
      });
    }
  } else if (schema.type === SchemaType.union) {
    assert(schema.innerSchema, "union inner schema is null or undefined");
    return checkUnion(schema.innerSchema, value);
  } else {
    return checkAtom(schema, value);
  }
}

function checkObject(
  schema: InnerSchemaForObjectSchema,
  value
): Optional<Error> {
  // schema 沒有規範到的欄位不檢查
  const toChecks: [string, Schema][] = toPairs(schema)
    .filter(([field, schema]) => {
      return (
        schema.isOptional === false ||
        (schema.isOptional && value[field] !== undefined)
      );
    })
    .map(([field, schema]) => [field, schema]);

  const errors = toChecks.map(([field, schema]) => {
    return _check(schema, value[field]).map((error) => ({
      paths: [field].concat(error.paths),
      msg: error.msg,
    }));
  });

  return Optional.of(Optional.filter(errors)[0]);
}

function checkArray(schema: Schema, value: any[]): Optional<Error> {
  const errors = value.map((v, idx) => {
    return _check(schema, v).map((error) => pair(idx, error));
  });

  return Optional.of(Optional.filter(errors)[0]).map(([idx, error]) => ({
    paths: [],
    msg: `array item ${idx} is wrong (${error2string(error)})`,
  }));
}

function checkTuple(schemas: Schema[], values: any[]): Optional<Error> {
  if (schemas.length !== values.length) {
    return Optional.of({ paths: [], msg: "tuple size error" });
  } else {
    const errors = zip(schemas, values).map(([schema, value], idx) =>
      _check(schema, value).map((error) => ({
        paths: [],
        msg: `tuple item ${idx} is wrong (${error2string(error)})`,
      }))
    );

    return Optional.of(Optional.filter(errors)[0]);
  }
}

function checkUnion(schemas: Schema[], value: any): Optional<Error> {
  const success = schemas.reduce((success, schema) => {
    if (success) {
      return success;
    } else {
      const error = _check(schema, value);
      return not(error.present);
    }
  }, false);
  if (success) {
    return Optional.empty();
  } else {
    return Optional.of({
      paths: [],
      msg: "not in union",
    });
  }
}

function checkAtom(schema: AtomSchema<any, any>, value): Optional<Error> {
  return Optional.of(schema.isa(value)).map((msg) => ({
    paths: [],
    msg,
  }));
}
