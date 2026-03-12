function KanbanBoard({ tickets = [] }) {

  const todo = tickets.filter(t => t.status === "TODO");
  const progress = tickets.filter(t => t.status === "IN_PROGRESS");
  const done = tickets.filter(t => t.status === "COMPLETED");

  return (
    <div className="kanban">

      <div className="column">
        <h3>TODO</h3>
        {todo.map(t => <Card key={t._id} ticket={t} />)}
      </div>

      <div className="column">
        <h3>IN PROGRESS</h3>
        {progress.map(t => <Card key={t._id} ticket={t} />)}
      </div>

      <div className="column">
        <h3>COMPLETED</h3>
        {done.map(t => <Card key={t._id} ticket={t} />)}
      </div>

    </div>
  );
}