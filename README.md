# elvquant_front

`elvquant_front` 是 `elvquant_core` 之上的中文 Streamlit 薄客户端，用于本地调试和体验研究流程。

它不是交易引擎。前端只允许做三件事：

- 选择本地配置和工作流
- 调用 `elvquant_core` 暴露的公开入口
- 渲染报告、图表、状态和原始输出

策略、风险控制、数据源校验、订单生成、执行模拟、记账、指标、券商路由和密钥处理都必须留在 `elvquant_core`。

## 本地启动

默认目录结构：

```text
work/
  elvquant_core/
  elvquant_front/
```

安装 core：

```powershell
cd ..\elvquant_core
.\.venv\Scripts\python -m pip install -e .
```

安装前端：

```powershell
cd ..\elvquant_front
py -m venv .venv
.\.venv\Scripts\python -m pip install --upgrade pip
.\.venv\Scripts\python -m pip install -e ".[dev]"
.\.venv\Scripts\python -m pip install -e ..\elvquant_core
```

运行 UI：

```powershell
.\.venv\Scripts\python -m streamlit run app.py --server.port 8501
```

打开：

```text
http://localhost:8501
```

如果 core 不在默认相邻目录，可以设置：

```powershell
$env:ELVQUANT_CORE_PATH="C:\path\to\elvquant_core"
```

## Stooq 真实数据研究

前端已经提供 `Stooq 真实数据研究` 工作流，但真实数据的准备仍然发生在 core 中。

前端会读取：

```text
elvquant_core/configs/stooq_etf_momentum.example.toml
```

并检查标准化数据是否存在：

```text
elvquant_core/data/processed/stooq_etf_eod.csv
```

如果文件不存在，UI 会显示中文状态和预计原始 CSV 文件名，不会把 traceback 直接扔给你。下载、标准化、point-in-time 校验和研究计算都留在 `elvquant_core`。

如果 Stooq 要求 `apikey`，只在 core 的运行环境里设置 `STOOQ_API_KEY`，或放进 core 仓库中被 gitignore 的本地 `.env`。不要写进前端、不要写进提交配置、不要提交真实 key。

当前默认原始缓存文件约定：

```text
elvquant_core/data/raw/stooq/spy_us_2015-01-01_2025-12-31.csv
elvquant_core/data/raw/stooq/qqq_us_2015-01-01_2025-12-31.csv
elvquant_core/data/raw/stooq/iwm_us_2015-01-01_2025-12-31.csv
elvquant_core/data/raw/stooq/tlt_us_2015-01-01_2025-12-31.csv
elvquant_core/data/raw/stooq/gld_us_2015-01-01_2025-12-31.csv
```

## 质量检查

```powershell
.\.venv\Scripts\python -m pytest
.\.venv\Scripts\python -m ruff check
```

## 边界铁律

如果前端需要新增业务动作，先在 `elvquant_core` 中实现并暴露公开入口，然后前端再调用这个入口。

前端测试会检查：

- 只能导入允许的 core 公开入口
- 不能构造交易核心对象
- 不能写入密钥值
- 必须保留中文本地调试文案
