document.addEventListener("DOMContentLoaded", () => {
  function GetCsv(infoList) {
    const match = [];
    const every = [];
    infoList.forEach((info, index) => {
      const request = new XMLHttpRequest();

      request.addEventListener("load", (event) => {
        const organize = Organize(
          event.target.responseText,
          info.period,
          index
        );

        const everyArray = {
          temperature: Every(organize.temperature, organize.date),
          humidity: Every(organize.humidity, organize.date),
          discomfort: Every(organize.discomfort, organize.date),
          date: Every(organize.humidity, organize.date, true),
          id: index + 1,
        };

        if (info.match) {
          match.push(organize);
          every.push(everyArray);
        }

        Table(organize, info.output.table);
        Line(organize, info.output.line, 0);
        Line(everyArray, info.output.every, 1);
        if (info.bar) Bar(organize.round, info.output.bar);
        Analysis(organize.temperature, info.output.analysis.temperature);
        Analysis(organize.humidity, info.output.analysis.humidity);
        Analysis(organize.discomfort, info.output.analysis.discomfort);

        if (infoList.length - 1 == index) {
          Time(organize, info.period.from);
          Time(organize, info.period.to);

          Match(
            match,
            {
              temperature: document.getElementById("temperature"),
              humidity: document.getElementById("humidity"),
              discomfort: document.getElementById("discomfort"),
            },
            organize,
            0
          );

          Match(
            every,
            {
              temperature: document.getElementById("everyT"),
              humidity: document.getElementById("everyH"),
              discomfort: document.getElementById("everyD"),
            },
            everyArray,
            3
          );
        }
      });

      request.open("GET", info.path, true);
      request.send();
    });
  }

  function Match(match, output, organize, op) {
    let datasetsTemperature = [];
    let datasetsHumidity = [];
    let datasetsDiscomfort = [];
    match.forEach((children, index) => {
      datasetsTemperature.push({
        label: `温度${children.id}`,
        data: children.temperature,
        borderColor: `rgba(${Math.round(255 / children.id)},0,0,1)`,
        backgroundColor: "rgba(0,0,0,0)",
        pointRadius: op,
        borderWidth: 1.5,
      });
    });
    match.forEach((children, index) => {
      datasetsHumidity.push({
        label: `湿度${children.id}`,
        data: children.humidity,
        borderColor: `rgba(0,0,${Math.round(255 / children.id)},1)`,
        backgroundColor: "rgba(0,0,0,0)",
        pointRadius: op,
        borderWidth: 1.5,
      });
    });
    match.forEach((children, index) => {
      datasetsDiscomfort.push({
        label: `不快指数${children.id}`,
        data: children.discomfort,
        borderColor: `rgba(0,${Math.round(255 / children.id)},0,1)`,
        backgroundColor: "rgba(0,0,0,0)",
        pointRadius: op,
        borderWidth: 1.5,
      });
    });
    var myChart = new Chart(output.temperature, {
      type: "line",
      data: {
        labels: organize.date,
        datasets: datasetsTemperature,
      },
    });
    var myChart = new Chart(output.humidity, {
      type: "line",
      data: {
        labels: organize.date,
        datasets: datasetsHumidity,
      },
    });
    var myChart = new Chart(output.discomfort, {
      type: "line",
      data: {
        labels: organize.date,
        datasets: datasetsDiscomfort,
      },
    });
  }

  function Every(data, date, op) {
    let temp = 0;
    let total = 0;
    let totalData = [];
    let totalDate = [];
    date.forEach((children, index) => {
      temp += 1;
      total += data[index];
      if (Minutes(children) - Minutes(date[0]) == 0 && index != 0) {
        totalData.push(Rounding(Rounding(total, 10) / temp, 10));
        totalDate.push(children);
        temp = 0;
        total = 0;
      }
    });
    if (op) {
      return totalDate;
    }

    return totalData;
  }

  function Minutes(data) {
    return new Date(data).getMinutes();
  }

  function Bar(data, output) {
    data.temperature.sort();
    data.humidity.sort();
    data.discomfort.sort();

    var myChart = new Chart(output.temperature, {
      type: "bar",
      data: {
        labels: Array.from(new Set(data.temperature)),
        datasets: [
          {
            label: "温度",
            data: [
              ...data.temperature
                .reduce(
                  (acc, curr) => acc.set(curr, (acc.get(curr) || 0) + 1),
                  new Map()
                )
                .values(),
            ],
            borderColor: "rgba(255,0,0,1)",
            backgroundColor: "rgba(255,0,0,0.5)",
            borderWidth: 1.5,
          },
        ],
      },
    });

    var myChart = new Chart(output.humidity, {
      type: "bar",
      data: {
        labels: Array.from(new Set(data.humidity)),
        datasets: [
          {
            label: "湿度",
            data: [
              ...data.humidity
                .reduce(
                  (acc, curr) => acc.set(curr, (acc.get(curr) || 0) + 1),
                  new Map()
                )
                .values(),
            ],
            borderColor: "rgba(0,0,255,1)",
            backgroundColor: "rgba(0,0,255,0.5)",
            borderWidth: 1.5,
          },
        ],
      },
    });

    var myChart = new Chart(output.discomfort, {
      type: "bar",
      data: {
        labels: Array.from(new Set(data.discomfort)),
        datasets: [
          {
            label: "不快指数",
            data: [
              ...data.discomfort
                .reduce(
                  (acc, curr) => acc.set(curr, (acc.get(curr) || 0) + 1),
                  new Map()
                )
                .values(),
            ],
            borderColor: "rgba(0,255,0,1)",
            backgroundColor: "rgba(0,255,0,0.5)",
            borderWidth: 1.5,
          },
        ],
      },
    });
  }

  function Analysis(array, output) {
    const sum = Sum(array);
    const average = Rounding(sum / array.length, 10);
    const median = Rounding(Median(array), 10);
    const max = array.concat().sort((a, b) => b - a)[0];
    const min = array.concat().sort((a, b) => a - b)[0];
    output.innerHTML = `
      <div>
        <p>合計値: ${sum}</p>
        <p>平均値: ${average}</p>
        <p>中央値: ${median}</p>
        <p>最大値: ${max}</p>
        <p>最小値: ${min}</p>
      </div>`;
  }

  function Rounding(value, option) {
    return Math.round(value * option) / option;
  }

  function Sum(array) {
    return Rounding(
      array.reduce((prev, current) => {
        return prev + current;
      }),
      10
    );
  }

  function Median(array, fn) {
    const half = (array.length / 2) | 0;
    const temp = array.concat().sort(fn);

    if (temp.length % 2) {
      return temp[half];
    }

    return (temp[half - 1] + temp[half]) / 2;
  }

  function Organize(data, period, index) {
    let dataList = data.split("\r\n").map((children) => {
      return children.split(",");
    });

    dataList.pop();

    const timeDate = dataList.map((children) => {
      return children[0];
    });

    if (
      period.from.get != "undefined" &&
      period.from.get != undefined &&
      period.to.get != "undefined" &&
      period.to.get != undefined
    ) {
      dataList = dataList.filter((children) => {
        return (
          new Date(period.from.get) <= new Date(children[0]) &&
          new Date(period.to.get) >= new Date(children[0])
        );
      });
    } else {
      if (period.from.get != "undefined" && period.from.get != undefined) {
        dataList = dataList.filter((children) => {
          return new Date(period.from.get) <= new Date(children[0]);
        });
      }
      if (period.to.get != "undefined" && period.to.get != undefined) {
        dataList = dataList.filter((children) => {
          return new Date(period.to.get) >= new Date(children[0]);
        });
      }
    }

    const date = dataList.map((children) => {
      return children[0];
    });
    const temperature = dataList.map((children) => {
      return Number(children[1]);
    });
    const humidity = dataList.map((children) => {
      return Number(children[2]);
    });
    const discomfort = dataList.map((children) => {
      return Number(children[3]);
    });

    let result = {
      id: index + 1,
      list: dataList,
      date: date,
      timeDate: timeDate,
      temperature: temperature,
      humidity: humidity,
      discomfort: discomfort,
      round: {
        temperature: temperature.map((children) => {
          return Rounding(children, 2);
        }),
        humidity: humidity.map((children) => {
          return Rounding(children, 2);
        }),
        discomfort: discomfort.map((children) => {
          return Rounding(children, 2);
        }),
      },
    };

    return result;
  }

  function Time(data, output) {
    let time = { year: [], month: [], day: [], hour: [], minute: [] };
    data.timeDate.forEach((children) => {
      const date = new Date(children);
      time.year.push(date.getFullYear());
      time.month.push(date.getMonth() + 1);
      time.day.push(date.getDate());
      time.hour.push(date.getHours());
      time.minute.push(date.getMinutes());
    });

    time = {
      year: Array.from(new Set(time.year)),
      month: Array.from(new Set(time.month)),
      day: Array.from(new Set(time.day)),
      hour: Array.from(new Set(time.hour)),
      minute: Array.from(new Set(time.minute)),
    };

    let initial;

    if (output.get != undefined) {
      initial = new Date(output.get);
      TimeSet(time.year, output.display.year, initial.getFullYear());
      TimeSet(time.month, output.display.month, initial.getMonth() + 1);
      TimeSet(time.day, output.display.day, initial.getDate());
      TimeSet(time.hour, output.display.hour, initial.getHours());
      TimeSet(time.minute, output.display.minute, initial.getMinutes());
    } else {
      TimeSet(time.year, output.display.year);
      TimeSet(time.month, output.display.month);
      TimeSet(time.day, output.display.day);
      TimeSet(time.hour, output.display.hour);
      TimeSet(time.minute, output.display.minute);
    }
  }

  function TimeSet(data, output, initial) {
    let selectTime = "";
    selectTime += `<option value>なし</option>`;
    Array.from(new Set(data)).forEach((children, index) => {
      selectTime += `<option value="${children}">${children}</option>`;
    });
    output.innerHTML = selectTime;
    const find = document.querySelector(
      `#${output.id} option[value='${initial}']`
    );
    if (find != null) {
      find.selected = true;
    }
  }

  function Line(data, output, size) {
    var myChart = new Chart(output.temperature, {
      type: "line",
      data: {
        labels: data.date,
        datasets: [
          {
            label: "温度",
            data: data.temperature,
            borderColor: "rgba(255,0,0,1)",
            backgroundColor: "rgba(0,0,0,0)",
            pointRadius: size,
            borderWidth: 1.5,
          },
        ],
      },
    });

    var myChart = new Chart(output.humidity, {
      type: "line",
      data: {
        labels: data.date,
        datasets: [
          {
            label: "湿度",
            data: data.humidity,
            borderColor: "rgba(0,0,255,1)",
            backgroundColor: "rgba(0,0,0,0)",
            pointRadius: size,
            borderWidth: 1.5,
          },
        ],
      },
    });

    var myChart = new Chart(output.discomfort, {
      type: "line",
      data: {
        labels: data.date,
        datasets: [
          {
            label: "不快指数",
            data: data.discomfort,
            borderColor: "rgba(0,255,0,1)",
            backgroundColor: "rgba(0,0,0,0)",
            pointRadius: size,
            borderWidth: 1.5,
          },
        ],
      },
    });
  }

  function Table(data, output) {
    let table = "";
    data.list
      .slice()
      .reverse()
      .forEach((children) => {
        table += "<tr>";
        children.forEach((grandChildren) => {
          table += `<td>${grandChildren}</td>`;
        });
        table += "</tr>";
      });
    output.innerHTML = table;
  }

  const url = new URL(window.location.href);
  const params = new URLSearchParams(window.location.search);
  const timeSetting = {
    from: {
      year: document.getElementById("fromYear"),
      month: document.getElementById("fromMonth"),
      day: document.getElementById("fromDay"),
      hour: document.getElementById("fromHour"),
      minute: document.getElementById("fromMinute"),
    },
    to: {
      year: document.getElementById("toYear"),
      month: document.getElementById("toMonth"),
      day: document.getElementById("toDay"),
      hour: document.getElementById("toHour"),
      minute: document.getElementById("toMinute"),
    },
  };

  GetCsv([
    {
      path: "./log1.csv",
      match: true,
      bar: true,
      period: {
        from: { get: url.searchParams.get("From") },
        to: { get: url.searchParams.get("To") },
      },
      output: {
        table: document.getElementById("table1"),
        every: {
          temperature: document.getElementById("everyT1"),
          humidity: document.getElementById("everyH1"),
          discomfort: document.getElementById("everyD1"),
        },
        line: {
          temperature: document.getElementById("temperature1"),
          humidity: document.getElementById("humidity1"),
          discomfort: document.getElementById("discomfort1"),
        },
        bar: {
          temperature: document.getElementById("barT1"),
          humidity: document.getElementById("barH1"),
          discomfort: document.getElementById("barD1"),
        },
        analysis: {
          temperature: document.getElementById("analysisT1"),
          humidity: document.getElementById("analysisH1"),
          discomfort: document.getElementById("analysisD1"),
        },
      },
    },
    {
      path: "./log2.csv",
      match: true,
      bar: true,
      period: {
        from: { get: url.searchParams.get("From"), display: timeSetting.from },
        to: { get: url.searchParams.get("To"), display: timeSetting.to },
      },
      output: {
        table: document.getElementById("table2"),
        every: {
          temperature: document.getElementById("everyT2"),
          humidity: document.getElementById("everyH2"),
          discomfort: document.getElementById("everyD2"),
        },
        line: {
          temperature: document.getElementById("temperature2"),
          humidity: document.getElementById("humidity2"),
          discomfort: document.getElementById("discomfort2"),
        },
        bar: {
          temperature: document.getElementById("barT2"),
          humidity: document.getElementById("barH2"),
          discomfort: document.getElementById("barD2"),
        },
        analysis: {
          temperature: document.getElementById("analysisT2"),
          humidity: document.getElementById("analysisH2"),
          discomfort: document.getElementById("analysisD2"),
        },
      },
    },
    {
      path: "./diff.csv",
      match: false,
      bar: false,
      period: {
        from: { get: url.searchParams.get("From"), display: timeSetting.from },
        to: { get: url.searchParams.get("To"), display: timeSetting.to },
      },
      output: {
        table: document.getElementById("tableD"),
        every: {
          temperature: document.getElementById("everyTD"),
          humidity: document.getElementById("everyHD"),
          discomfort: document.getElementById("everyDD"),
        },
        line: {
          temperature: document.getElementById("temperatureD"),
          humidity: document.getElementById("humidityD"),
          discomfort: document.getElementById("discomfortD"),
        },
        analysis: {
          temperature: document.getElementById("analysisTD"),
          humidity: document.getElementById("analysisHD"),
          discomfort: document.getElementById("analysisDD"),
        },
      },
    },
  ]);

  function SetTime(data) {
    if (!Object.values(data).some((item) => item.value == "")) {
      return `${data.year.value}/${data.month.value}/${data.day.value} ${data.hour.value}:${data.minute.value}`;
    }
  }

  document.getElementById("jump").addEventListener("click", (e) => {
    const from = timeSetting.from;
    const to = timeSetting.to;
    params.set("From", SetTime(from));
    params.set("To", SetTime(to));
    window.location.search = params.toString();
  });
});
