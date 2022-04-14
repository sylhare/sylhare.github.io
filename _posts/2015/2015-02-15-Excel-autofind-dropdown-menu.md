---
layout: post
title: How to create a dropdown search menu from an excel spreadsheet
color: rgb(0, 110 ,81)
tags: [tips]
---

## Excel auto find drop down menu

#### Create a Named range

To manage the named ranges, you can go in **Formulas** > **Name Manager**. You can also use defined range by their name in Excel formulas.

##### 1. Static
To [create a named range](https://support.office.com/fr-fr/article/Cr%C3%A9er-une-liste-d%C3%A9roulante-7693307a-59ef-400a-b769-c5402dce407b) in excel, 
you can select a column of data then **right click** then select **define name** the name will be the name of the range and how it will be referred to.
The **refers to** is the range itself and is auto populated with the range of selected cells when clicking on **define name**

##### 2. Dynamic
To get a [dynamic named range](https://trumpexcel.com/named-ranges-in-excel/) you will need to replace the **refers to** of the named range by this kind of formula (for example if values are in the A column):

```coffee
=$A$2:INDEX($A$2:$A$100;COUNTIF($A$2:$A$100;"<>"&""))
```
This formula will start looking at value from `A2` to the index (the coordinates) of the last non-empty cell (up to 100 in here).
It will only refers to the populated cells in the dynamic named range.


#### Get other information from the entered item
##### 1. Example:

- You have a range of value with a defined name: `list` with all the values to find.
- You have the case where the search value is entered in `C4`. 

Then you can add this formula in the cells next to `C4` to map the cell using what has been entered in `C4`.

```coffee
=INDIRECT("tab_name!"&ADDRESS(MATCH(C4;List;0)+1;COLUMN(List)-1))
```

- The `MATCH` function will match the `ROW` of the entered value (here `C4`) and the `List` value to get the right one.
- the `ADDRESS` function will map the found value and its relative position. 
(Used with `+1` or `-1` in the `ROW, COLUMN` you can modify the address you get). 
- the `INDIRECT` function print the value of the input coordinates (the `"tab_name!"` where the value is, and the address of the found value).

##### 2. Another Example

Or you can use this formula which will look in `List` if it finds the value in `C4`:

```coffee
=VLOOKUP(C4;List;2;FALSE)
```

#### Have a google like search

[Here](https://trumpexcel.com/excel-drop-down-list-with-search-suggestions/) is a sweet example that requires 1 column with the values and 3 helping columns,
and a cell that will be used to do the Google-like search:

| **E**. Available values | **F**. criteria matching | **G**. Occurrence count | **H**. Found values |
|------------------|-------------------|-----------------|--------------|
| value_one        | 1                 | 1               | value_one    |
| value_two        | 0                 |                 | value_three  |
| value_three      | 1                 | 2               |              |

- Column #1 : **Available Values** you add the values that will be looked at
- Column #2 : **Criteria matching** you add this formula:

```coffee
=ISNUMBER(IFERROR(SEARCH($B$3,E3,1);""))
```

This formula returns 1 if part of what is in cell `E3` in the **Available values** column is also in cell `B3`, the **search cell**.

- Column #3 : **Occurrence count** you add this formula:

```coffee
=IF(F3=1;COUNTIF($F$3:F3,1);"") 
```

This formula starting at `F3`, with `F3` the **criteria matching** look if the **criteria matching** is 1 and count how many there was since first cell (`$F$3`).

- Column #4 : **Found Values** stack all the criteria matching values with this formula:

```coffee
=IFERROR(INDEX($E$3:$E$22,MATCH(ROWS($G$3:G3),$G$3:$G$22,0)),"")
```

With `G3` in the **Occurrence count** column. It works with `MATCH` and `INDEX` looking for occurrence. 
The `IFERROR` will show the corresponding value indexed, or nothing.

You can use this formula to create the dynamic range from the **found values** in `H3`:

```coffee
=$H$3:INDEX($H$3:$H$22;MAX($G$3:$G$22);1)
```

The name will be used for the combobox (dropdown in developer > insert > activeX). 
Here are the properties to look for:

- AutoWordSelect: False
- LinkedCell: B3
- ListFillRange: name of the created named range
- MatchEntry: 2 – fmMatchEntryNone

The LinkedCell `B3` is the searching cell, it will print the result of the search.
If you haven't change the name of the combobox, the default one should be `ComboBox1` and you can copy and paste that into the VBA part of your sheet:

```vb
Private Sub ComboBox1_Change()
'DropDownList is the name of the created Named range
ComboBox1.ListFillRange = "DropDownList"
Me.ComboBox1.DropDown
End Sub
```

This sub `ComboBox1_change()` overwrites the default attitude of the ComboBox object when changed.

You also need some lists for the comboBox to update automatically, one for the dropdown that will be the results of the matched value of the occurrence count.
