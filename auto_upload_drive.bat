@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: ==========================================================
:: Auto Upload para Google Drive + disparo opcional de update
:: ==========================================================
:: COMO USAR:
:: 1) Ajuste os caminhos abaixo (SOURCE_DIR e DRIVE_SYNC_DIR).
:: 2) Opcional: preencha APPS_SCRIPT_WEBHOOK para forcar update no Sheets.
:: 3) Execute este .bat e deixe aberto.
::
:: Observacao:
:: - Este script NAO usa API do ERP.
:: - Ele monitora arquivos locais e copia para pasta sincronizada no Drive.
:: - Requer Google Drive for Desktop instalado (ou outro sync local).
:: ==========================================================

:: Pasta onde o ERP exporta os arquivos
set "SOURCE_DIR=C:\Users\%USERNAME%\Documents\Kleber_Sanchez"

:: Pasta local sincronizada com o Google Drive
set "DRIVE_SYNC_DIR=G:\Meu Drive\ERP_Imports"

:: Arquivos monitorados (base no seu fluxo)
set "FILE_A=010101"
set "FILE_B=010401"
set "FILE_C=010701"

:: Extensoes aceitas (adicione/remova conforme necessario)
set "EXT_1=.xlsx"
set "EXT_2=.csv"
set "EXT_3=.xls"

:: Intervalo entre verificacoes (segundos)
set "POLL_SECONDS=20"

:: Webhook opcional (Apps Script Web App) para forcar atualizacao no Sheets
:: Exemplo: https://script.google.com/macros/s/AKfycb.../exec
set "APPS_SCRIPT_WEBHOOK="

:: Estado/log
set "STATE_DIR=%~dp0.autoupload_state"
set "STATE_FILE=%STATE_DIR%\processed_state.txt"
set "LOG_FILE=%STATE_DIR%\auto_upload.log"

if not exist "%STATE_DIR%" mkdir "%STATE_DIR%" >nul 2>&1
if not exist "%STATE_FILE%" type nul > "%STATE_FILE%"
if not exist "%LOG_FILE%" type nul > "%LOG_FILE%"

echo ========================================================== 
echo [AUTO-UPLOAD] Iniciado em %date% %time%
echo Source: %SOURCE_DIR%
echo Drive : %DRIVE_SYNC_DIR%
echo Estado: %STATE_FILE%
echo ========================================================== 
echo.

if not exist "%SOURCE_DIR%" (
  echo [ERRO] SOURCE_DIR nao existe: %SOURCE_DIR%
  goto :end
)

if not exist "%DRIVE_SYNC_DIR%" (
  echo [ERRO] DRIVE_SYNC_DIR nao existe: %DRIVE_SYNC_DIR%
  echo Dica: confirme a letra/caminho do Google Drive for Desktop.
  goto :end
)

:loop
call :check_and_upload "%FILE_A%"
call :check_and_upload "%FILE_B%"
call :check_and_upload "%FILE_C%"

timeout /t %POLL_SECONDS% /nobreak >nul
goto :loop

:check_and_upload
set "BASENAME=%~1"

for %%E in (%EXT_1% %EXT_2% %EXT_3%) do (
  set "CANDIDATE=%SOURCE_DIR%\!BASENAME!%%~E"
  if exist "!CANDIDATE!" (
    for %%F in ("!CANDIDATE!") do (
      set "SIG=!BASENAME!%%~E|%%~zF|%%~tF"
      set "FOUND=0"

      for /f "usebackq delims=" %%L in ("%STATE_FILE%") do (
        if /I "%%L"=="!SIG!" set "FOUND=1"
      )

      if "!FOUND!"=="0" (
        echo [NOVO] !CANDIDATE!
        call :log "NOVO detectado: !CANDIDATE!"

        copy /Y "!CANDIDATE!" "%DRIVE_SYNC_DIR%\!BASENAME!%%~E" >nul
        if errorlevel 1 (
          echo [ERRO] Falha ao copiar !CANDIDATE! para Drive.
          call :log "ERRO copy: !CANDIDATE!"
        ) else (
          echo [OK] Enviado para Drive: %DRIVE_SYNC_DIR%\!BASENAME!%%~E
          call :log "UPLOAD ok: !BASENAME!%%~E"

          >>"%STATE_FILE%" echo !SIG!

          if not "%APPS_SCRIPT_WEBHOOK%"=="" (
            call :trigger_webhook "!BASENAME!%%~E"
          )
        )
      )
    )
  )
)
goto :eof

:trigger_webhook
set "FILE_SENT=%~1"
echo [HOOK] Disparando webhook para atualizar planilha...

curl -s -X POST "%APPS_SCRIPT_WEBHOOK%" ^
  -H "Content-Type: application/json" ^
  -d "{\"file\":\"%FILE_SENT%\",\"source\":\"auto_upload_drive.bat\"}" >nul

if errorlevel 1 (
  echo [ERRO] Falha ao chamar webhook.
  call :log "ERRO webhook para %FILE_SENT%"
) else (
  echo [OK] Webhook chamado com sucesso.
  call :log "Webhook ok para %FILE_SENT%"
)
goto :eof

:log
set "MSG=%~1"
>>"%LOG_FILE%" echo [%date% %time%] %MSG%
goto :eof

:end
echo.
echo [FIM] Script encerrado.
pause
endlocal
