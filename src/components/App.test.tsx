import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

const renderApp = () =>
  render(
    <MantineProvider>
      <App />
    </MantineProvider>,
  );

const pick = async (user: string, service: string) => {
  const events = userEvent.setup();
  await events.selectOptions(screen.getByTestId("user-select"), user);
  await events.selectOptions(screen.getByTestId("service-select"), service);
};

describe("экран расчёта доступа", () => {
  it("предлагает выбрать сотрудника и сервис до расчёта", () => {
    renderApp();

    expect(screen.getByTestId("access-result")).toHaveTextContent("Выберите сотрудника и сервис");
  });

  it("показывает доступ по прямому разрешению", async () => {
    renderApp();
    await pick("Борис Каримов", "Репозиторий");

    expect(screen.getByTestId("access-result")).toHaveTextContent("Доступ есть");
    expect(screen.getByTestId("access-sources")).toHaveTextContent("Прямое разрешение");
  });

  it("показывает доступ по разрешению группы", async () => {
    renderApp();
    await pick("Вера Лисицына", "Репозиторий");

    expect(screen.getByTestId("access-result")).toHaveTextContent("Доступ есть");
    expect(screen.getByTestId("access-sources")).toHaveTextContent("Группа «Разработка»");
  });

  it("показывает прямой и групповой источники вместе", async () => {
    renderApp();
    await pick("Анна Белова", "Учёт");

    expect(screen.getByTestId("access-sources")).toHaveTextContent("Прямое разрешение");
    expect(screen.getByTestId("access-sources")).toHaveTextContent("Группа «Бухгалтерия»");
  });

  it("сообщает об отсутствии доступа", async () => {
    renderApp();
    await pick("Вера Лисицына", "Учёт");

    expect(screen.getByTestId("access-result")).toHaveTextContent("Доступа нет");
    expect(screen.queryByTestId("access-sources")).not.toBeInTheDocument();
  });
});

const optionLabels = (testId: string) =>
  Array.from((screen.getByTestId(testId) as HTMLSelectElement).options).map(
    (option) => option.textContent,
  );

const selectedLabel = (testId: string) => {
  const select = screen.getByTestId(testId) as HTMLSelectElement;
  return select.options[select.selectedIndex]?.textContent;
};

describe("фильтр сотрудников по группе", () => {
  it("по умолчанию выбирает «Все группы» с пустым значением и перечисляет группы", () => {
    renderApp();

    const filter = screen.getByTestId("group-filter") as HTMLSelectElement;
    expect(filter.value).toBe("");
    expect(selectedLabel("group-filter")).toBe("Все группы");
    expect(optionLabels("group-filter")).toEqual([
      "Все группы",
      "Бухгалтерия",
      "Разработка",
      "Поддержка",
    ]);
  });

  it("оставляет в списке сотрудников только участников выбранной группы", async () => {
    renderApp();
    await userEvent.setup().selectOptions(screen.getByTestId("group-filter"), "Поддержка");

    expect(optionLabels("user-select")).toEqual(["Не выбран", "Борис Каримов"]);
  });

  it("без фильтра показывает всех сотрудников", () => {
    renderApp();

    expect(optionLabels("user-select")).toEqual([
      "Не выбран",
      "Анна Белова",
      "Борис Каримов",
      "Вера Лисицына",
    ]);
  });

  it("возвращает всех сотрудников при выборе «Все группы»", async () => {
    renderApp();
    const events = userEvent.setup();
    await events.selectOptions(screen.getByTestId("group-filter"), "Поддержка");
    await events.selectOptions(screen.getByTestId("group-filter"), "Все группы");

    expect(optionLabels("user-select")).toEqual([
      "Не выбран",
      "Анна Белова",
      "Борис Каримов",
      "Вера Лисицына",
    ]);
  });

  it("сбрасывает сотрудника, который не входит в выбранную группу", async () => {
    renderApp();
    await pick("Анна Белова", "Учёт");
    await userEvent.setup().selectOptions(screen.getByTestId("group-filter"), "Разработка");

    expect(selectedLabel("user-select")).toBe("Не выбран");
    expect(screen.getByTestId("access-result")).toHaveTextContent("Выберите сотрудника и сервис");
    expect(screen.queryByTestId("access-sources")).not.toBeInTheDocument();
  });

  it("оставляет выбранным участника группы и прежний ответ расчёта", async () => {
    renderApp();
    await pick("Анна Белова", "Учёт");
    await userEvent.setup().selectOptions(screen.getByTestId("group-filter"), "Бухгалтерия");

    expect(selectedLabel("user-select")).toBe("Анна Белова");
    expect(screen.getByTestId("access-result")).toHaveTextContent("Доступ есть");
    expect(screen.getByTestId("access-sources")).toHaveTextContent("Прямое разрешение");
    expect(screen.getByTestId("access-sources")).toHaveTextContent("Группа «Бухгалтерия»");
  });

  it("не возвращает сброшенного сотрудника при выборе «Все группы»", async () => {
    renderApp();
    await pick("Анна Белова", "Учёт");
    const events = userEvent.setup();
    await events.selectOptions(screen.getByTestId("group-filter"), "Разработка");
    await events.selectOptions(screen.getByTestId("group-filter"), "Все группы");

    expect(selectedLabel("user-select")).toBe("Не выбран");
    expect(screen.getByTestId("access-result")).toHaveTextContent("Выберите сотрудника и сервис");
  });
});
