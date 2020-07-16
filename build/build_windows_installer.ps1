# powershell -Command "& {Get-ExecutionPolicy}"


# Taken from psake https://github.com/psake/psake

<#
.SYNOPSIS
  This is a helper function that runs a scriptblock and checks the PS variable $lastexitcode
  to see if an error occcured. If an error is detected then an exception is thrown.
  This function allows you to run command-line programs without having to
  explicitly check the $lastexitcode variable.

.EXAMPLE
  exec { svn info $repository_trunk } "Error executing SVN. Please verify SVN command-line client is installed"
#>
function Exec
{
	[CmdletBinding()]
	param(
		[Parameter(Position=0,Mandatory=1)][scriptblock]$cmd,
		[Parameter(Position=1,Mandatory=0)][string]$errorMessage = ($msgs.error_bad_command -f $cmd)
	)
	& $cmd
	if ($lastexitcode -ne 0) {
		throw ("Exec: " + $errorMessage)
	}
}

$env:VSCODE_ARCH = "x64"
exec { yarn gulp "compile-build" }
exec { yarn gulp "compile-extensions-build" }
exec { yarn gulp "minify-vscode" }
exec { yarn gulp "vscode-win32-$env:VSCODE_ARCH-min-ci" }
exec { yarn gulp "vscode-win32-$env:VSCODE_ARCH-code-helper" }
exec { yarn gulp "vscode-win32-$env:VSCODE_ARCH-inno-updater" }
exec { yarn gulp "vscode-win32-$env:VSCODE_ARCH-archive" "vscode-win32-$env:VSCODE_ARCH-user-setup" }
