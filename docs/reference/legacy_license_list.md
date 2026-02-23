# DELISPECT - 現状ライセンスリスト（Pipfile / package.json）

## 目次

- [DELISPECT - 現状ライセンスリスト（Pipfile / package.json）](#delispect---現状ライセンスリストpipfile--packagejson)
  - [目次](#目次)
  - [1. 概要](#1-概要)
  - [2. 依存パッケージライセンス一覧](#2-依存パッケージライセンス一覧)
    - [2.1 Pipfile [packages]](#21-pipfile-packages)
    - [2.2 Pipfile [dev-packages]](#22-pipfile-dev-packages)
    - [2.3 package.json dependencies](#23-packagejson-dependencies)
    - [2.4 package.json devDependencies](#24-packagejson-devdependencies)
    - [2.5 ライセンス未特定（要追加確認）](#25-ライセンス未特定要追加確認)
  - [文書情報](#文書情報)

## 1. 概要

- 本書は、DELISPECTで利用する依存パッケージの現状ライセンス一覧を記載する。
- 2026-02-16時点。`Pipfile` / `package.json` 内容を基に、PyPI JSON API と npm registry metadata から取得した情報を整理した。
- 技術選定方針とライセンスポリシーは `02_technology_stack.md` を参照する。

## 2. 依存パッケージライセンス一覧

### 2.1 Pipfile [packages]

| パッケージ | 指定バージョン | 調査時解決バージョン | ライセンス | 調査ソース |
|---|---|---|---|---|
| django | `==3.2.8` | `3.2.8` | BSD-3-Clause | [pypi:django](https://pypi.org/pypi/django/3.2.8/json) |
| psycopg2-binary | `==2.9.6` | `2.9.6` | LGPL with exceptions | [pypi:psycopg2-binary](https://pypi.org/pypi/psycopg2-binary/2.9.6/json) |
| requests | `*` | `2.32.5` | Apache-2.0 | [pypi:requests](https://pypi.org/pypi/requests/json) |
| django-cors-headers | `*` | `4.9.0` | MIT | [pypi:django-cors-headers](https://pypi.org/pypi/django-cors-headers/json) |
| pydantic | `*` | `2.12.5` | MIT | [pypi:pydantic](https://pypi.org/pypi/pydantic/json) |
| pandas | `*` | `3.0.0` | BSD-3-Clause | [pypi:pandas](https://pypi.org/pypi/pandas/json) |
| openpyxl | `*` | `3.1.5` | MIT | [pypi:openpyxl](https://pypi.org/pypi/openpyxl/json) |
| returns | `*` | `0.26.0` | BSD-3-Clause | [pypi:returns](https://pypi.org/pypi/returns/json) |
| django-injector | `*` | `0.3.1` | BSD | [pypi:django-injector](https://pypi.org/pypi/django-injector/json) |
| djangorestframework | `*` | `3.16.1` | BSD | [pypi:djangorestframework](https://pypi.org/pypi/djangorestframework/json) |
| djangorestframework-simplejwt | `*` | `5.5.1` | MIT | [pypi:djangorestframework-simplejwt](https://pypi.org/pypi/djangorestframework-simplejwt/json) |
| pyyaml | `*` | `6.0.3` | MIT | [pypi:pyyaml](https://pypi.org/pypi/pyyaml/json) |
| django-simple-history | `*` | `3.11.0` | BSD | [pypi:django-simple-history](https://pypi.org/pypi/django-simple-history/json) |
| whitenoise | `*` | `6.11.0` | MIT | [pypi:whitenoise](https://pypi.org/pypi/whitenoise/json) |
| django-apscheduler | `*` | `0.7.0` | MIT | [pypi:django-apscheduler](https://pypi.org/pypi/django-apscheduler/json) |
| tenacity | `*` | `9.1.4` | Apache-2.0 | [pypi:tenacity](https://pypi.org/pypi/tenacity/json) |

> 注意: `psycopg2-binary` は `LGPL with exceptions` のため、利用時は `02_technology_stack.md` の運用方針（配布を伴わない自社運用）を満たすこと。

### 2.2 Pipfile [dev-packages]

| パッケージ | 指定バージョン | 調査時解決バージョン | ライセンス | 調査ソース |
|---|---|---|---|---|
| pytest | `*` | `9.0.2` | MIT | [pypi:pytest](https://pypi.org/pypi/pytest/json) |
| flake8 | `*` | `7.3.0` | MIT | [pypi:flake8](https://pypi.org/pypi/flake8/json) |
| black | `*` | `26.1.0` | MIT | [pypi:black](https://pypi.org/pypi/black/json) |
| pytest-mock | `*` | `3.15.1` | MIT | [pypi:pytest-mock](https://pypi.org/pypi/pytest-mock/json) |
| isort | `*` | `7.0.0` | MIT | [pypi:isort](https://pypi.org/pypi/isort/json) |
| pytest-describe | `*` | `3.1.0` | MIT | [pypi:pytest-describe](https://pypi.org/pypi/pytest-describe/json) |
| mypy | `*` | `1.19.1` | MIT | [pypi:mypy](https://pypi.org/pypi/mypy/json) |
| pytest-django | `*` | `4.12.0` | BSD-3-Clause | [pypi:pytest-django](https://pypi.org/pypi/pytest-django/json) |
| python-dotenv | `*` | `1.2.1` | BSD-3-Clause | [pypi:python-dotenv](https://pypi.org/pypi/python-dotenv/json) |
| pytest-env | `*` | `1.3.2` | MIT | [pypi:pytest-env](https://pypi.org/pypi/pytest-env/json) |
| exceptiongroup | `*` | `1.3.1` | MIT | [pypi:exceptiongroup](https://pypi.org/pypi/exceptiongroup/json) |

### 2.3 package.json dependencies

| パッケージ | 指定バージョン | 調査時解決バージョン | ライセンス | 調査ソース |
|---|---|---|---|---|
| @emotion/react | `^11.14.0` | `11.14.0` | MIT | [npm:@emotion/react](https://registry.npmjs.org/@emotion/react/11.14.0) |
| @emotion/styled | `^11.14.0` | `11.14.1` | MIT | [npm:@emotion/styled](https://registry.npmjs.org/@emotion/styled/11.14.1) |
| @mui/icons-material | `^6.2.0` | `6.5.0` | MIT | [npm:@mui/icons-material](https://registry.npmjs.org/@mui/icons-material/6.5.0) |
| @mui/material | `^6.2.0` | `6.5.0` | MIT | [npm:@mui/material](https://registry.npmjs.org/@mui/material/6.5.0) |
| @mui/styled-engine-sc | `^6.2.0` | `6.4.9` | MIT | [npm:@mui/styled-engine-sc](https://registry.npmjs.org/@mui/styled-engine-sc/6.4.9) |
| next | `^15.1.0` | `15.5.12` | MIT | [npm:next](https://registry.npmjs.org/next/15.5.12) |
| pino | `^9.5.0` | `9.14.0` | MIT | [npm:pino](https://registry.npmjs.org/pino/9.14.0) |
| react | `^18.3.1` | `18.3.1` | MIT | [npm:react](https://registry.npmjs.org/react/18.3.1) |
| react-content-loader | `^7.0.2` | `7.1.2` | MIT | [npm:react-content-loader](https://registry.npmjs.org/react-content-loader/7.1.2) |
| react-dom | `^18.3.1` | `18.3.1` | MIT | [npm:react-dom](https://registry.npmjs.org/react-dom/18.3.1) |
| react-hook-form | `^7.54.1` | `7.71.1` | MIT | [npm:react-hook-form](https://registry.npmjs.org/react-hook-form/7.71.1) |
| styled-components | `^6.1.13` | `6.3.9` | MIT | [npm:styled-components](https://registry.npmjs.org/styled-components/6.3.9) |
| swr | `^2.2.5` | `2.4.0` | MIT | [npm:swr](https://registry.npmjs.org/swr/2.4.0) |
| zod | `^3.24.1` | `3.25.76` | MIT | [npm:zod](https://registry.npmjs.org/zod/3.25.76) |

### 2.4 package.json devDependencies

| パッケージ | 指定バージョン | 調査時解決バージョン | ライセンス | 調査ソース |
|---|---|---|---|---|
| @babel/core | `^7.26.0` | `7.29.0` | MIT | [npm:@babel/core](https://registry.npmjs.org/@babel/core/7.29.0) |
| @babel/plugin-transform-class-properties | `^7.25.9` | `7.28.6` | MIT | [npm:@babel/plugin-transform-class-properties](https://registry.npmjs.org/@babel/plugin-transform-class-properties/7.28.6) |
| @babel/plugin-transform-private-methods | `^7.25.9` | `7.28.6` | MIT | [npm:@babel/plugin-transform-private-methods](https://registry.npmjs.org/@babel/plugin-transform-private-methods/7.28.6) |
| @babel/plugin-transform-private-property-in-object | `^7.25.9` | `7.28.6` | MIT | [npm:@babel/plugin-transform-private-property-in-object](https://registry.npmjs.org/@babel/plugin-transform-private-property-in-object/7.28.6) |
| @eslint/eslintrc | `^3.2.0` | `3.3.3` | MIT | [npm:@eslint/eslintrc](https://registry.npmjs.org/@eslint/eslintrc/3.3.3) |
| @eslint/js | `^9.17.0` | `9.39.2` | MIT | [npm:@eslint/js](https://registry.npmjs.org/@eslint/js/9.39.2) |
| @mdx-js/react | `^3.1.0` | `3.1.1` | MIT | [npm:@mdx-js/react](https://registry.npmjs.org/@mdx-js/react/3.1.1) |
| @playwright/test | `^1.57.0` | `1.58.2` | Apache-2.0 | [npm:@playwright/test](https://registry.npmjs.org/@playwright/test/1.58.2) |
| @storybook/addon-essentials | `^8.4.7` | `8.6.15` | MIT | [npm:@storybook/addon-essentials](https://registry.npmjs.org/@storybook/addon-essentials/8.6.15) |
| @storybook/addon-interactions | `^8.4.7` | `8.6.15` | MIT | [npm:@storybook/addon-interactions](https://registry.npmjs.org/@storybook/addon-interactions/8.6.15) |
| @storybook/addon-links | `^8.4.7` | `8.6.15` | MIT | [npm:@storybook/addon-links](https://registry.npmjs.org/@storybook/addon-links/8.6.15) |
| @storybook/addon-onboarding | `^8.4.7` | `8.6.15` | MIT | [npm:@storybook/addon-onboarding](https://registry.npmjs.org/@storybook/addon-onboarding/8.6.15) |
| @storybook/addon-themes | `^8.4.7` | `8.6.15` | MIT | [npm:@storybook/addon-themes](https://registry.npmjs.org/@storybook/addon-themes/8.6.15) |
| @storybook/blocks | `^8.4.7` | `8.6.15` | MIT | [npm:@storybook/blocks](https://registry.npmjs.org/@storybook/blocks/8.6.15) |
| @storybook/nextjs | `^8.4.7` | `8.6.15` | MIT | [npm:@storybook/nextjs](https://registry.npmjs.org/@storybook/nextjs/8.6.15) |
| @storybook/react | `^8.4.7` | `8.6.15` | MIT | [npm:@storybook/react](https://registry.npmjs.org/@storybook/react/8.6.15) |
| @storybook/test | `^8.4.7` | `8.6.15` | MIT | [npm:@storybook/test](https://registry.npmjs.org/@storybook/test/8.6.15) |
| @testing-library/jest-dom | `^6.6.3` | `6.9.1` | MIT | [npm:@testing-library/jest-dom](https://registry.npmjs.org/@testing-library/jest-dom/6.9.1) |
| @testing-library/react | `^16.1.0` | `16.3.2` | MIT | [npm:@testing-library/react](https://registry.npmjs.org/@testing-library/react/16.3.2) |
| @testing-library/user-event | `^14.6.1` | `14.6.1` | MIT | [npm:@testing-library/user-event](https://registry.npmjs.org/@testing-library/user-event/14.6.1) |
| @tsconfig/node22 | `^22.0.0` | `22.0.5` | MIT | [npm:@tsconfig/node22](https://registry.npmjs.org/@tsconfig/node22/22.0.5) |
| @tsconfig/strictest | `^2.0.5` | `2.0.8` | MIT | [npm:@tsconfig/strictest](https://registry.npmjs.org/@tsconfig/strictest/2.0.8) |
| @types/jest | `^29.5.14` | `29.5.14` | MIT | [npm:@types/jest](https://registry.npmjs.org/@types/jest/29.5.14) |
| @types/node | `^22.10.2` | `22.19.11` | MIT | [npm:@types/node](https://registry.npmjs.org/@types/node/22.19.11) |
| @types/react | `^19.0.1` | `19.2.14` | MIT | [npm:@types/react](https://registry.npmjs.org/@types/react/19.2.14) |
| @types/react-content-loader | `^3.1.4` | `3.1.4` | MIT | [npm:@types/react-content-loader](https://registry.npmjs.org/@types/react-content-loader/3.1.4) |
| @types/react-dom | `^19.0.2` | `19.2.3` | MIT | [npm:@types/react-dom](https://registry.npmjs.org/@types/react-dom/19.2.3) |
| @types/styled-components | `^5.1.34` | `5.1.36` | MIT | [npm:@types/styled-components](https://registry.npmjs.org/@types/styled-components/5.1.36) |
| babel-loader | `^9.2.1` | `9.2.1` | MIT | [npm:babel-loader](https://registry.npmjs.org/babel-loader/9.2.1) |
| eslint | `^8.57.1` | `8.57.1` | MIT | [npm:eslint](https://registry.npmjs.org/eslint/8.57.1) |
| eslint-config-airbnb-base | `^15.0.0` | `15.0.0` | MIT | [npm:eslint-config-airbnb-base](https://registry.npmjs.org/eslint-config-airbnb-base/15.0.0) |
| eslint-config-next | `^15.1.0` | `15.5.12` | MIT | [npm:eslint-config-next](https://registry.npmjs.org/eslint-config-next/15.5.12) |
| eslint-config-prettier | `^9.1.0` | `9.1.2` | MIT | [npm:eslint-config-prettier](https://registry.npmjs.org/eslint-config-prettier/9.1.2) |
| eslint-plugin-import | `^2.31.0` | `2.32.0` | MIT | [npm:eslint-plugin-import](https://registry.npmjs.org/eslint-plugin-import/2.32.0) |
| eslint-plugin-prettier | `^5.2.1` | `5.5.5` | MIT | [npm:eslint-plugin-prettier](https://registry.npmjs.org/eslint-plugin-prettier/5.5.5) |
| eslint-plugin-react | `^7.37.2` | `7.37.5` | MIT | [npm:eslint-plugin-react](https://registry.npmjs.org/eslint-plugin-react/7.37.5) |
| eslint-plugin-react-hooks | `^5.1.0` | `5.2.0` | MIT | [npm:eslint-plugin-react-hooks](https://registry.npmjs.org/eslint-plugin-react-hooks/5.2.0) |
| eslint-plugin-storybook | `^0.11.1` | `0.11.6` | MIT | [npm:eslint-plugin-storybook](https://registry.npmjs.org/eslint-plugin-storybook/0.11.6) |
| eslint-plugin-unused-imports | `^4.1.4` | `4.4.1` | MIT | [npm:eslint-plugin-unused-imports](https://registry.npmjs.org/eslint-plugin-unused-imports/4.4.1) |
| globals | `^15.13.0` | `15.15.0` | MIT | [npm:globals](https://registry.npmjs.org/globals/15.15.0) |
| husky | `^9.1.7` | `9.1.7` | MIT | [npm:husky](https://registry.npmjs.org/husky/9.1.7) |
| jest | `^29.7.0` | `29.7.0` | MIT | [npm:jest](https://registry.npmjs.org/jest/29.7.0) |
| jest-environment-jsdom | `^29.7.0` | `29.7.0` | MIT | [npm:jest-environment-jsdom](https://registry.npmjs.org/jest-environment-jsdom/29.7.0) |
| lint-staged | `^15.2.11` | `15.5.2` | MIT | [npm:lint-staged](https://registry.npmjs.org/lint-staged/15.5.2) |
| npm-run-all | `^4.1.5` | `4.1.5` | MIT | [npm:npm-run-all](https://registry.npmjs.org/npm-run-all/4.1.5) |
| prettier | `^3.4.2` | `3.8.1` | MIT | [npm:prettier](https://registry.npmjs.org/prettier/3.8.1) |
| storybook | `^8.4.7` | `8.6.15` | MIT | [npm:storybook](https://registry.npmjs.org/storybook/8.6.15) |
| tsconfig-paths-webpack-plugin | `^4.2.0` | `4.2.0` | MIT | [npm:tsconfig-paths-webpack-plugin](https://registry.npmjs.org/tsconfig-paths-webpack-plugin/4.2.0) |
| typescript | `^5.7.2` | `5.9.3` | Apache-2.0 | [npm:typescript](https://registry.npmjs.org/typescript/5.9.3) |
| typescript-eslint | `^8.18.0` | `8.56.0` | MIT | [npm:typescript-eslint](https://registry.npmjs.org/typescript-eslint/8.56.0) |

### 2.5 ライセンス未特定（要追加確認）

| パッケージ | 指定バージョン | 調査時解決バージョン | 調査ソース |
|---|---|---|---|
| uuid | `*` | `1.30` | [pypi:uuid](https://pypi.org/pypi/uuid/json) |

## 文書情報

- 作成日: 2026年02月17日
- バージョン: v1.0
- 作成者: Codex
- 変更履歴:
  - v1.0 - `02_technology_stack.md` から現状ライセンスリストを分離して新規作成
