const Express = require("express");
const { getDBHandler } = require("../db");

const RequestHandler = Express.Router(); //*Objeto especial, va a manejar las rutas

//*Obtener todos los Todo's de la tabla
RequestHandler.get("/to-dos", async (req, res) => {
  try {
    const dbHandler = await getDBHandler();
    const todos = await dbHandler.all("SELECT * FROM todos");

    dbHandler.close(); //*Cierro la conexion de la BD
    if (todos.length === 0) {
      //*En el caso de que el arreglo de los To Dos este vacio:
      //*Si todos es undefined o si existe y es un arreglo pero su longitud es 0
      res.status(404).send({ message: "To Dos Not Found" }).end();
    } else {
      res.send({ todos });
    }
  } catch (error) {
    res.status(500).send({
      error: "Something went wrong when trying to get to dos list",
      errorInfo: error.message,
    });
  }
});

//*CREAR un TODO de la tabla de Todo's
RequestHandler.post("/to-dos", async (req, res) => {
  try {
    const { title, description, isDone: is_done } = req.body;

    const dbHandler = await getDBHandler();

    const newTodo = await dbHandler.run(`
        INSERT INTO todos (title, description, is_done)
        VALUES (
            '${title}',
            '${description}',
            ${is_done}
        )
    `); //* Se insertan los datos a la BD

    await dbHandler.close(); //* Se cierra el controlador de la BD
    //console.log(newTodo);
    res.send({ newTodo: { title, description, is_done, ...newTodo } });
  } catch (error) {
    res.status(500).send({
      error: `Something went wrong when trying to create a new to do:`,
      errorInfo: error.message,
    });
  }
});

//*Eliminar un TODO de la tabla de Todo's por medio del id
RequestHandler.delete("/to-dos/:id", async (req, res) => {
  try {
    const todoId = req.params.id;

    if (!todoId) {
      res.status(400).send({ error: `A todo id was expected, got ${todoId}` });
    }

    const dbHandler = await getDBHandler();

    const deletedTodo = await dbHandler.run(
      "DELETE FROM todos WHERE id = ?",
      todoId
    );

    await dbHandler.close();

    res.send({ todoRemoved: { ...deletedTodo } });
  } catch (error) {
    console.log("HERE");
    response.status(500).send({
      error: `Something went wrong when trying to delete a to do:`,
      errorInfo: error.message,
    });
  }
});

//*Actualizar un TODO de la tabla de Todo's por medio del id
RequestHandler.patch("/to-dos/:id", async (req, res) => {
  try {
    const todoId = req.params.id;

    if (!todoId) {
      res.status(400).send({ error: `A todo id was expected, got ${todoId}` });
    }

    const dbHandler = await getDBHandler();
    const { title, description, isDone: is_done } = req.body;

    const todoToUpdate = await dbHandler.get(
      "SELECT * FROM todos WHERE id = ?",
      todoId
    );

    const updateTodo = await dbHandler.run(
      "UPDATE todos SET title = ? , description = ? , is_done = ? WHERE id = ?",
      title || todoToUpdate.title,
      description || todoToUpdate.description,
      is_done !== undefined ? is_done : todoToUpdate.is_done,
      todoId
    );

    /*
    const updateTodo = await dbHandler.get(
      "SELECT * FROM todos WHERE id = ?",
      todoId
    );
    */

    await dbHandler.close();

    res.status(200).send({ updateTodo });
  } catch (error) {
    res.status(500).send({
      error: "Something went wrong when trying to update a the to do",
      errorInfo: error.message,
    });
  }
});

//*Obtener un todo por medio de un id de la BD
RequestHandler.get("/to-dos/:id", async (req, res) => {
  try {
    const todoId = req.params.id;

    if (!todoId) {
      res.status(400).send({ error: `A todo id was expected, got ${todoId}` });
    }

    const dbHandler = await getDBHandler();
    const todo = await dbHandler.get(
      "SELECT * FROM todos WHERE id = ?",
      todoId
    );

    await dbHandler.close();

    res.status(200).send({ todo });
  } catch (error) {
    res.status(500).send({
      error: "Something went wrong when trying to get a the to do",
      errorInfo: error.message,
    });
  }
});

module.exports = RequestHandler;
