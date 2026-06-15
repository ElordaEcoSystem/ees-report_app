import { useEffect, useState } from "react";
import {
  fetchUsers,
  fetchUpdateUserRole,
  fetchUpdateUser,
  fetchCreateUser,
  fetchDeleteUser,
  fetchDepartments,
  type AdminUser,
} from "@/shared/model/api";
import type { Department, Role } from "@/features/board/board-type";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/kit/table";

const ROLES: Role[] = ["ADMIN", "MANAGER", "OBSERVER", "EXECUTOR"];

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Администратор",
  MANAGER: "Менеджер",
  OBSERVER: "Наблюдатель",
  EXECUTOR: "Исполнитель",
  CUSTOMER: "Заказчик",
};

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MANAGER: "bg-purple-100 text-purple-700",
  OBSERVER: "bg-blue-100 text-blue-700",
  EXECUTOR: "bg-green-100 text-green-700",
  CUSTOMER: "bg-gray-100 text-gray-700",
};

export function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Форма создания пользователя
  const [form, setForm] = useState({ email: "", password: "", fullName: "", position: "", role: "EXECUTOR" as Role, departmentId: "" });
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Удаление пользователя
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Редактирование пользователя
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", position: "", email: "", newPassword: "", departmentId: "" });
  const [editError, setEditError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchDepartments()])
      .then(([u, d]) => { setUsers(u); setDepartments(d); })
      .catch(() => setError("Не удалось загрузить данные"))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      const updated = await fetchUpdateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch {
      setError("Не удалось изменить роль");
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditTarget(user);
    setEditForm({ fullName: user.fullName ?? "", position: user.position ?? "", email: user.email, newPassword: "", departmentId: user.departmentId ?? "" });
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditTarget(null);
    setEditError(null);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditing(true);
    setEditError(null);
    try {
      const payload: { fullName?: string; position?: string; email?: string; newPassword?: string; departmentId?: string | null } = {
        fullName: editForm.fullName || undefined,
        position: editForm.position,
        email: editForm.email || undefined,
        departmentId: editForm.departmentId || null,
      };
      if (editForm.newPassword) payload.newPassword = editForm.newPassword;

      const updated = await fetchUpdateUser(editTarget.id, payload);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      closeEditModal();
    } catch (err: unknown) {
      const axiosMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setEditError(axiosMsg ?? "Ошибка сохранения");
    } finally {
      setEditing(false);
    }
  };

  const openDeleteModal = (user: AdminUser) => {
    setDeleteTarget(user);
    setAdminPassword("");
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setAdminPassword("");
    setDeleteError(null);
  };

  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await fetchDeleteUser(deleteTarget.id, adminPassword);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      closeDeleteModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка удаления";
      const axiosMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setDeleteError(axiosMsg ?? msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      const user = await fetchCreateUser({ ...form, position: form.position || undefined, departmentId: form.departmentId || null });
      setUsers((prev) => [...prev, user]);
      setForm({ email: "", password: "", fullName: "", position: "", role: "EXECUTOR", departmentId: "" });
    } catch (err: unknown) {
      const axiosMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setCreateError(axiosMsg ?? "Ошибка создания пользователя");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="container mx-auto p-6 flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Управление пользователями</h1>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Форма создания */}
      <section className="border rounded-lg p-4 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Добавить пользователя</h2>
        <form onSubmit={handleCreateUser} className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">ФИО</label>
            <Input
              placeholder="Иванов Иван Иванович"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Должность</label>
            <Input
              placeholder="Инженер КИП"
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Email</label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Пароль</label>
            <Input
              type="password"
              placeholder="Минимум 8 символов"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Роль</label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Отдел</label>
            <Select
              value={form.departmentId || "none"}
              onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v === "none" ? "" : v }))}
            >
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Без отдела —</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? "Создание..." : "Добавить"}
          </Button>
        </form>
        {createError && (
          <p className="text-sm text-red-600">{createError}</p>
        )}
      </section>

      {/* Таблица пользователей */}
      <section>
        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Должность</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Отдел</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{user.position ?? "—"}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell className="text-sm">{user.department?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user.id, v as Role)}
                    >
                      <SelectTrigger className="w-44 h-8">
                        <SelectValue>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
                            {ROLE_LABELS[user.role]}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => openEditModal(user)}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openDeleteModal(user)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Модал редактирования */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Редактирование пользователя</h2>
            <form onSubmit={handleEditUser} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">ФИО</label>
                <Input
                  placeholder="Иванов Иван Иванович"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Должность</label>
                <Input
                  placeholder="Инженер КИП"
                  value={editForm.position}
                  onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Email</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Новый пароль <span className="text-gray-400">(оставьте пустым чтобы не менять)</span></label>
                <Input
                  type="password"
                  placeholder="Минимум 8 символов"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm((f) => ({ ...f, newPassword: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Отдел</label>
                <Select
                  value={editForm.departmentId || "none"}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, departmentId: v === "none" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Без отдела —</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editError && (
                <p className="text-sm text-red-600">{editError}</p>
              )}
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={closeEditModal} disabled={editing}>
                  Отмена
                </Button>
                <Button type="submit" disabled={editing}>
                  {editing ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модал подтверждения удаления */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-red-600">Удаление пользователя</h2>
            <p className="text-sm text-gray-700">
              Вы собираетесь удалить пользователя <span className="font-bold">{deleteTarget.fullName}</span> ({deleteTarget.email}).
              Все его записи будут также удалены. Это действие необратимо.
            </p>
            <form onSubmit={handleDeleteUser} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Введите ваш пароль для подтверждения</label>
                <Input
                  type="password"
                  placeholder="Пароль администратора"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {deleteError && (
                <p className="text-sm text-red-600">{deleteError}</p>
              )}
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={closeDeleteModal} disabled={deleting}>
                  Отмена
                </Button>
                <Button type="submit" disabled={deleting || !adminPassword} className="bg-red-600 hover:bg-red-700 text-white">
                  {deleting ? "Удаление..." : "Удалить"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export const Component = AdminPage;
