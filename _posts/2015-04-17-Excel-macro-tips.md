---
layout: post
title: Excel Macro tips
color: rgb(0, 110, 81)
tags: [excel]
---


In excel, you have to enable first the macro (and select the developer option). 
Then you can press `[ALT] + [F11]` to go into edit macro mode. 
To learn you can start with "recording macro" to see what excel is recording, 
but it's not the most efficient way.

#### Comment / Uncomment bloc of code

There's a Comment / Uncomment button that can be toggled. For that **right click** on the **menu bar** then click on **edit**, 
the edit tool bar will appear (you can place it in your quick access bar). There should be a **comment** and **Uncomment** **icon**. This commands will basically add or remove `'` at the beginning of every selected ligns. 

#### Calling a Sub

Here are an example on how to call a subroutine: [here](https://msdn.microsoft.com/en-us/library/office/gg251432.aspx)
It can be tricky.
```vb
Test "N23:Q23", 1
Call Test("N23:Q23", 1)


Sub Test(xRange As Range, val As Integer)
	'some coding
End Sub
```


#### Accelerate Macro

Here are a couple of lines that can greatly improve the efficiency of your VBA macro.

```vb
Sub example()
	'Stop automatic calculation of excel cells
	Application.Calculation = xlCalculationManual
	'Stop screen updating
	Application.ScreenUpdating = False

	'Some code

	'Put it back to "normal"
	Application.Calculation = xlCalculationAutomatic
	Application.ScreenUpdating = True
End Sub
```

#### Hide "0" value of empty cells

Sometime there are some 0 that pops up with the below formulas, 
so here is a trick to hide them through formating.
Available [here](https://support.office.com/en-us/article/Display-or-hide-zero-values-3ec7a433-46b8-4516-8085-a00e9e476b03):

- Home > Format > Format Cells
- Number > Custom
- type : `0;;;@`

#### Userform

Some example for the Userform

```vb
Userform
    Textbox 
        Multiline : True
        EnterKeyBehavior = True (sinon ctrl + Enter)
```


#### Closing procedure

Procedure to close a file

```vb
Sub arret()
	'stop the current sub
    ActiveWorkbook.Save
    ActiveWorkbook.Close True
End Sub
```

Close the file after 10 seconds

```vb
Private Sub Workbook_Open()
     temp = Now + TimeValue(« 00:00:10 »)
     Application.OnTime temp, « arret »
End Sub
```
