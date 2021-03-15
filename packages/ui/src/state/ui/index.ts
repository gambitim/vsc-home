import { atom, selector } from 'recoil';
import { defaultLayout } from './defaults';

const $layout = selector({
  key: 'ui.layout',
  get: ({ get }) => {
    const layoutState: any = {};
    const widgets: any = get($widgets);
    for (const { layout, id } of widgets) {
      for (const breakpoint in layout) {
        const layoutBreakpoint = layoutState[breakpoint] || [];
        const i = id;
        layoutState[breakpoint] = [
          ...layoutBreakpoint,
          { ...layout[breakpoint], i },
        ];
      }
    }
    return layoutState;
  },
  set: ({ get, set }, newLayout: any) => {
    const widgetLayout = get($widgets);
    const newWidgetLayout: any[] = [];
    for (const breakpoint in newLayout) {
      for (const widget of newLayout[breakpoint]) {
        const { i } = widget;
        const index = widgetLayout.findIndex(({ id }) => id === i);
        if (~index) {
          newWidgetLayout[index] = {
            ...widgetLayout[index],
            layout: {
              ...newWidgetLayout[index]?.layout,
              [breakpoint]: widget,
            },
          };
        }
      }
    }
    set($widgets, newWidgetLayout);
  },
});

const $widgets = atom({
  key: 'ui.widgets',
  default: defaultLayout,
});

const $editMode = atom({
  key: 'ui.editMode',
  default: false,
});

export const layout = $layout;
export const widgets = $widgets;
export const editMode = $editMode;
