@echo off

echo check PowerShell execution policy:
powershell -Command "& {Get-ExecutionPolicy}"

powershell -File build\build_windows_installer.ps1
