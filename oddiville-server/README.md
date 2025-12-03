"# oddiville-server" 
"# oddiville-server" 



//1 raw material detail notification - reached
const sendRawMaterialReachedNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "raw-material-reached",
  });
};

//2 order detail notification - edited
const sendEditOrderNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "edit-order",
  });
};

//3 worker detail notification - arrived
const sendWorkerArrivedNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "worker-multiple",
  });
};

//4 order detail notification - shipped
const sendOrderShippedNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "order-shipped",
  });
};

//5 order detail notification - reached
const sendOrderReachedNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "order-reached",
  });
};

//6 product detail notification - updated
const sendProductUpdatedNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "production-completed",
  });
};

//7 lane detail notification - occupied
const sendLaneOccupiedNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "lane-occupied",
  });
};

//8 order detail notification - canceled
const sendOrderCanceledNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "cancel-order",
  });
};

//9 order detail notification - ready
const sendOrderReadyNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "order-ready",
  });
};

//10 lane detail notification - empty
const sendLaneEmptyNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "lane-empty",
  });
};

//11 package detail notification - end
const sendPackageComesToEndNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "package-comes-to-end",
  });
};

//12 material detail notification - verify
const sendVerifyMaterialNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "verify-material",
  });
};

//13 product detail notification - alert
const sendProductAlertNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "product-alert",
  });
};

//14 raw material detail notification - ordered
const sendRawMaterialOrderedNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-informative:new", {
    id,
    details,
    timestamp: new Date(),
    type: "raw-material-ordered",
  });
};

// 15. calendar-event notification (today category)
const sendCalendarEventNotification = (id, details) => {
  const io = getIO();
  io.emit("notification-today:new", {
    id,
    details,
    timestamp: new Date(),
    type: "calendar-event-scheduled",
  });
};

const sendNotificationByType = (type, payload) => {
  
  switch (type) {
    case "raw-material-reached":
      return sendRawMaterialReachedNotification(payload.id, payload.details);

    case "raw-material-ordered":
      return sendRawMaterialOrderedNotification(payload.id, payload.details);

    case "edit-order":
      return sendEditOrderNotification(payload.id, payload.details);

    case "worker-single":
      return sendWorkerArrivedNotification(payload.id, payload.details);

    case "worker-multiple":
      return sendWorkerArrivedNotification(payload.id, payload.details);

    case "order-shipped":
      return sendOrderShippedNotification(payload.id, payload.details);

    case "order-reached":
      return sendOrderReachedNotification(payload.id, payload.details);

    case "production-completed":
      return sendProductUpdatedNotification(payload.id, payload.details);

    case "lane-occupied":
      return sendLaneOccupiedNotification(payload.id, payload.details);

    case "cancel-order":
      return sendOrderCanceledNotification(payload.id, payload.details);

    case "order-ready":
      return sendOrderReadyNotification(payload.id, payload.details);

    case "lane-empty":
      return sendLaneEmptyNotification(payload.id, payload.details);

    case "package-comes-to-end":
      return sendPackageComesToEndNotification(payload.id, payload.details);

    case "verify-material":
      return sendVerifyMaterialNotification(payload.id, payload.details);

    case "product-alert":
      return sendProductAlertNotification(payload.id, payload.details);

    case "calendar-event-scheduled":
      return sendCalendarEventNotification(payload.id, payload.details);

    default:
      console.warn(`[Socket Notification] Unknown type: ${type}`);
  }
};















Good question — and a smart, serious concern. There are several layers where you must harden protection so the “root admin” can’t be removed accidentally or maliciously: **application layer (Sequelize + routes), database layer (triggers / permissions), and operations/CI rules (prevent force sync / destructive migrations)**. I’ll give a practical, defense-in-depth plan + copy-paste code you can drop in now.

---

# Strategy (defense in depth)

1. **Mark a root** — store an immutable flag or fixed role (e.g. `role: 'root'` or `isRoot: true`) on the Admin row you want protected.
2. **App-level safety (required)**

   * Block deletes/role changes in Sequelize model hooks (`beforeDestroy`, `beforeBulkDestroy`, `beforeUpdate`).
   * Block delete routes / admin UI from deleting root (explicit checks).
3. **DB-level safety (recommended)**

   * Add a Postgres trigger that aborts DELETE/UPDATE that would remove or demote the root.
   * Use DB user permissions so app user cannot run destructive admin commands (limit who can DROP/TABLE, etc.).
4. **Operational safeguards**

   * Never call `sequelize.sync({ force: true })` in production; guard it with env variables and require human approval.
   * Backups, audit logs, and alerts on attempted root changes.
5. **Policy & authentication**

   * Require MFA, limit who can run “delete admin” operations, log and notify when attempted.

---

# 1) Make a root flag / immutable role

Add a column to `Admins` (migration):

```js
// example migration snippet (sequelize-cli)
await queryInterface.addColumn('admins', 'isRoot', {
  type: Sequelize.BOOLEAN,
  allowNull: false,
  defaultValue: false,
});
```

Set your real root admin row to `isRoot: true` (once).

---

# 2) Sequelize model hooks — prevent deletes & demotion

Place this in your Admin model file (or a central models init):

```js
// models/Admin.js (or wherever you define Admin)
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    email: DataTypes.STRING,
    userpass: DataTypes.STRING,
    role: DataTypes.STRING,
    isRoot: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // ... other fields
  }, {
    // options
  });

  // Prevent deletion of root
  Admin.addHook('beforeDestroy', async (instance, options) => {
    if (instance.get('isRoot')) {
      throw new Error('Operation forbidden: root admin cannot be deleted.');
    }
  });

  // Prevent bulk deletes that would affect root
  Admin.addHook('beforeBulkDestroy', async (options) => {
    // options.where may be undefined — be defensive
    const where = options.where || {};
    // query DB to see if any root admin would be affected
    const wouldRemove = await Admin.findOne({ where: { ...where, isRoot: true }, paranoid: false });
    if (wouldRemove) {
      throw new Error('Operation forbidden: bulk delete would remove root admin.');
    }
  });

  // Prevent demotion (removing isRoot or changing role from root)
  Admin.addHook('beforeUpdate', async (instance, options) => {
    // `changed()` exists on instances
    if (instance.previous('isRoot') && instance.changed('isRoot') && !instance.get('isRoot')) {
      throw new Error('Operation forbidden: cannot unset isRoot on root admin.');
    }
    if (instance.previous('role') === 'root' && instance.changed('role') && instance.get('role') !== 'root') {
      throw new Error('Operation forbidden: cannot change role of root admin.');
    }
  });

  return Admin;
};
```

Notes:

* `beforeBulkDestroy` runs for `Model.destroy({ where: ...})`. We query to see whether the `where` would match `isRoot: true`.
* If you use paranoid (soft delete), adjust accordingly (`paranoid: false` may be used in checks).
* Throwing an error aborts the operation.

---

# 3) Protect route-level delete handlers

Any admin-delete API routes must check the target before proceeding:

```js
// example express route
router.delete('/admins/:id', async (req, res) => {
  const { id } = req.params;
  const target = await Admin.findByPk(id);
  if (!target) return res.status(404).send({ error: 'Not found' });
  if (target.isRoot) return res.status(403).send({ error: 'Cannot remove root admin' });

  // additional RBAC: only super-admin can delete etc
  // perform delete
  await target.destroy();
  res.send({ success: true });
});
```

Also protect any admin bulk-delete endpoints `Admin.destroy({ where: ... })` — require an explicit `force` boolean and deny if `isRoot` would match.

---

# 4) DB-level trigger (Postgres) — last line of defense

If someone somehow bypasses app-level checks, a database trigger ensures the row cannot be deleted or demoted at the DB level.

Example SQL trigger to prevent delete or update of `isRoot`:

```sql
-- Add trigger function
CREATE OR REPLACE FUNCTION prevent_root_admin_mods()
RETURNS trigger AS $$
BEGIN
  -- prevent delete if isRoot
  IF (TG_OP = 'DELETE') THEN
    IF OLD.isRoot = true THEN
      RAISE EXCEPTION 'Cannot delete root admin';
    END IF;
    RETURN OLD;
  END IF;

  -- prevent update that would unset isRoot or change role from root
  IF (TG_OP = 'UPDATE') THEN
    IF OLD.isRoot = true AND NEW.isRoot = false THEN
      RAISE EXCEPTION 'Cannot unset isRoot for root admin';
    END IF;
    IF OLD.role = 'root' AND NEW.role <> 'root' THEN
      RAISE EXCEPTION 'Cannot change role of root admin';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to admins table
CREATE TRIGGER trg_prevent_root_admin_mods
  BEFORE DELETE OR UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION prevent_root_admin_mods();
```

This is strong and cannot be bypassed by a bad app user — only a DBA with permission could drop the trigger.

---

# 5) Prevent `sequelize.sync({ force: true })` in production

`force: true` drops tables — dangerous. Protect it:

```js
if (process.env.NODE_ENV === 'development' && process.env.SHOULD_SYNC === 'true') {
  await sequelize.sync({ force: true });
} else if (process.env.SHOULD_SYNC === 'true') {
  console.warn('Refusing to run sync({force:true}) in non-development environment');
}
```

Or require an explicit env var like `ALLOW_FORCE_SYNC=true` and ensure CI/CD never sets it for production.

Also ensure you do **not** run destructive migrations via automated scripts without human approval.

---

# 6) DB user permissions & auditing

* Use a DB user with **limited privileges** for the application (no DROP or DDL). Keep a separate DBA user for migrations.
* Enable Postgres audit logging (or use an audit trigger) to record who attempted modifications to `admins`.
* Put alerts on failed attempts to delete root.

---

# 7) Additional operational & policy recommendations

* **Backups**: Frequent DB backups and tested restore procedures.
* **MFA and multi-person approval** for operations that can restore/delete admin accounts.
* **Monitoring & alerting**: Alert on attempts to delete admin or trigger exceptions in admin hooks.
* **Unit and integration tests** to assert that root cannot be deleted or demoted.
* **Documentation**: Document the root account handling so future devs/operators know why.

---

# Summary (short)

* Mark the root using `isRoot: true` or `role: 'root'`.
* Block deletes/role changes in Sequelize `beforeDestroy`, `beforeBulkDestroy`, `beforeUpdate` hooks.
* Add a Postgres trigger to block DELETE/UPDATE of the root row as database-level enforcement.
* Forbid `sequelize.sync({ force: true })` in production and restrict DB users.
* Add route-level checks, logging, backups, and alerts.

---

If you want, I can:

* produce a full Sequelize migration + Admin model snippet with hooks wired in, or
* produce the exact SQL trigger file you can run, or
* add an Express middleware that prevents dangerous routes for root and returns consistent errors.

Which of those would you like me to generate now?
